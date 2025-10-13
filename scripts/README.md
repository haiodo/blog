# Weekly Git Statistics

Скрипт для анализа git статистики за последнюю неделю по всем репозиториям, указанным в `repositories.md`.

## Возможности

- 📝 Подсчет количества коммитов за неделю (личных и общих)
- ➕ Подсчет добавленных строк кода (личных и общих)
- ➖ Подсчет удаленных строк кода (личных и общих)
- 📄 Подсчет измененных файлов
- 🏷️ Подсчет созданных тегов
- 👥 Подсчет количества участников по каждому репозиторию
- 📊 Общая статистика по всем репозиториям
- 📈 Анализ личного вклада в изменения кодовой базы
- 📋 Генерация markdown отчета с таблицей статистики
- 🎨 Цветной вывод в консоли

## Использование

### Запуск напрямую

```bash
node weekly_stats.js
```

### Запуск через npm

```bash
npm run stats
# или
npm run weekly
```

### Запуск как исполняемый файл

```bash
./weekly_stats.js
```

## Требования

- Node.js
- Git
- Файл `repositories.md` в той же директории со списком репозиториев

## Формат repositories.md

```markdown
# Repositories I've working on:

1. ProjectName: /path/to/repository
2. AnotherProject: /path/to/another/repository
```

## Что анализируется

Скрипт анализирует изменения за последние 7 дней для текущего git пользователя (определяется через `git config user.name`) в каждом указанном репозитории, а также собирает общую статистику по репозиториям и вычисляет процент личного вклада.

## Выходные файлы

Скрипт создает markdown отчет `weekly-report-YYYY-MM-DD.md` в той же директории со следующей информацией:

- Таблица с детальной статистикой по каждому репозиторию
- Сравнение личных и общих изменений
- Процент личного вклада в каждый репозиторий
- Количество участников по репозиториям
- Общая сводка активности

## Пример вывода

```text
=== Git Statistics for the Last Week ===
Period: 2025-10-06 to 2025-10-13

📁 Repository: Huly.core
📂 Path: /Users/user/project
👤 Author: John Doe
📝 Commits: 15
➕ Lines added: 1250
➖ Lines deleted: 320
📄 Files changed: 45
🏷️ Tags created: 2

=== 📊 TOTAL STATISTICS ===
📝 Total commits: 94
➕ Total lines added: 142763
➖ Total lines deleted: 84291
📄 Total files changed: 3848
🏷️ Total tags created: 31
📈 Net lines change: +58472
```