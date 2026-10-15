# Source

## Owner's request, 2026-10-12 (chat, translated verbatim is not possible — recorded as asked, in Russian)

> А почему мы не сужаем выборку сразу а делаем это вручную? Должна быть причина, посмотри предыдущие окммиты для этого места, может там есть объяснение

> Окей. Давай теперь так: как мы можем исправить это? Так чтобы и не доставать все записи сразу и при этом чтобы работало на всех бд? ПЛюс ко всему я что-то припоминаю, мы вроде сузили окно поиска. Это не должно возвращат ьвсе записи теперь.

## Issue #123, verbatim

Split out of #108, which fixes the two paths that can be fixed cheaply and deliberately leaves this one alone.

## What is not fixed by #108

`findByCollection` loads every translation job for a collection, unpaginated. #108 flattens that for **enqueue** and **cancel** by excluding completed jobs — a completed job can never be superseded or cancelled, so those paths simply stop caring how much history exists.

The two status endpoints cannot use that lever, because the history *is* their content:

- `get-collection-status` returns each job's `status`; excluding completed jobs would leave the panel empty immediately after everything translated successfully.
- `get-document-status` reduces to the latest job per target locale and reports `completed_at`; with completed jobs excluded there is nothing to reduce.

#108 does give them the one free improvement — narrowing the query to the requested collection, which works on SQLite, Postgres and MongoDB alike. Measured, that divides the loaded rows by the number of translatable collections. It does **not** change the shape: the cost still grows linearly with that collection's history.

## The three options, and what each costs an editor

**Bound by recency** — fetch only jobs newer than some age. A document translated three months ago stops reporting a status, and the editor cannot tell "never translated" from "translated long ago". Note that *staleness* is computed separately, from provenance records, so "is this translation current" survives; what is lost is "was there a run, did it fail".

**Bound by count** — fetch the first N, newest first. This has a trap worth stating plainly: `get-document-status` keeps the latest job **per target locale**, so if one locale's most recent job is older than N others, that locale's row silently disappears. A count bound trades a slow correct answer for a fast wrong one, which is the same failure the unpaginated read was avoiding.

**Leave it** — accept linear growth. Defensible on the numbers: these endpoints are hit once when a human opens a panel, where 60 ms at 2000 jobs is imperceptible, whereas the enqueue path runs once per document in a bulk action, where the same curve is multiplied by the batch size.

## Measured

Synthetic history, identical on all three adapters. Rows loaded per call:

| history | today | narrowed to one collection (#108) |
|---|---|---|
| 50 | 50 | 17 |
| 200 | 200 | 67 |
| 800 | 800 | 267 |
| 2000 | 2000 | 667 |

## The alternative that removes the question

#122 (retention for the plugin's own completed jobs) would stop the table growing at all, which fixes these endpoints without bounding anything and without any loss of visible information. If retention lands, this issue likely closes unfixed.

## Priority

Low, and deliberately so — the honest trigger for picking it up is a real project reporting a slow status panel, not a benchmark. Recorded so the next person to meet the linear curve knows it was measured, discussed, and left alone on purpose.


## Clarifications

Owner, in chat, 2026-10-12, when asked what `get-collection-status` should return with no selection:

> Нам же по сути надо просто посчитать количество сколько задач в каком статусе, для этого нам не нужно делать выборку ВСЕХ записей. Я всё еще хочу показывать статус по всей коллекции а не тольк по дументам на странице, это буде твводить в заблужение.

Owner, in chat, 2026-10-12, on the weight issue #103's reporter carries:

> контракт эндпоинтов не публичный. То, что кто-то строит на нем свою админку его проблемы. Мы его полностью ломать не будем, но учитывать этот факт стоит.

Owner, in chat, 2026-10-12, deciding what the panel's `Translated` row counts:

> Это и по смыслу и по функцоналу неверно. translated по идее должен показывать количество переведенных записей не вообще за всё время, а за текущий run, то есть сколько переведено записей за текущий запуск. Например если пользователь выбрал 10 записей и нажал перевести, то надо показывать сколько записей из этих 10 переведено, а не вообще.
