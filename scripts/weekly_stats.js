#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Цвета для консоли
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    purple: '\x1b[35m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

// Функция для цветного вывода
function colorLog(text, color = 'reset') {
    console.log(`${colors[color]}${text}${colors.reset}`);
}

// Получить дату неделю назад
function getWeekAgoDate() {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
}

// Получить сегодняшнюю дату
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Проверить существование директории и что это git репозиторий
function isValidGitRepo(repoPath) {
    try {
        return fs.existsSync(repoPath) && fs.existsSync(path.join(repoPath, '.git'));
    } catch (error) {
        return false;
    }
}

// Выполнить git команду в определенной директории
function execGitCommand(command, repoPath) {
    try {
        const result = execSync(command, { 
            cwd: repoPath, 
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        });
        return result.trim();
    } catch (error) {
        return '';
    }
}

// Получить статистику по репозиторию
function getRepoStats(repoPath, repoName, weekAgo, today) {
    if (!isValidGitRepo(repoPath)) {
        colorLog(`❌ Repository not found or not a git repo: ${repoPath}`, 'red');
        return {
            commits: 0,
            linesAdded: 0,
            linesDeleted: 0,
            filesChanged: 0,
            tags: 0,
            totalCommits: 0,
            totalLinesAdded: 0,
            totalLinesDeleted: 0,
            totalContributors: 0,
            myContribution: 0
        };
    }

    // Получить имя автора
    const author = execGitCommand('git config user.name', repoPath);
    
    colorLog(`\n📁 Repository: ${repoName}`, 'blue');
    colorLog(`📂 Path: ${repoPath}`, 'blue');
    colorLog(`👤 Author: ${author}`, 'blue');
    
    // Получить коммиты за неделю
    const commitsOutput = execGitCommand(
        `git log --author="${author}" --since="${weekAgo}" --until="${today}" --oneline`,
        repoPath
    );
    
    const commits = commitsOutput ? commitsOutput.split('\n').length : 0;
    colorLog(`📝 Commits: ${commits}`, 'green');
    
    // Показать последние коммиты
    if (commits > 0) {
        colorLog('Recent commits:', 'yellow');
        const recentCommits = commitsOutput.split('\n').slice(0, 5);
        recentCommits.forEach(commit => {
            if (commit.trim()) {
                console.log(`  ${commit}`);
            }
        });
        console.log();
    }
    
    // Получить статистику изменений строк
    const statsOutput = execGitCommand(
        `git log --author="${author}" --since="${weekAgo}" --until="${today}" --numstat --pretty=format:""`,
        repoPath
    );
    
    let linesAdded = 0;
    let linesDeleted = 0;
    let filesChanged = 0;
    
    if (statsOutput) {
        const lines = statsOutput.split('\n').filter(line => line.trim() && !line.startsWith('commit'));
        filesChanged = lines.length;
        
        lines.forEach(line => {
            const parts = line.split('\t');
            if (parts.length >= 2) {
                const added = parseInt(parts[0]) || 0;
                const deleted = parseInt(parts[1]) || 0;
                linesAdded += added;
                linesDeleted += deleted;
            }
        });
    }
    
    colorLog(`➕ Lines added: ${linesAdded}`, 'green');
    colorLog(`➖ Lines deleted: ${linesDeleted}`, 'red');
    colorLog(`📄 Files changed: ${filesChanged}`, 'purple');
    
    // Получить теги созданные за неделю
    const tagsOutput = execGitCommand(
        `git tag --list --sort=-creatordate --format='%(creatordate:short) %(refname:short)'`,
        repoPath
    );
    
    let tags = 0;
    if (tagsOutput) {
        const tagLines = tagsOutput.split('\n').filter(line => {
            const parts = line.trim().split(' ');
            if (parts.length >= 2) {
                const tagDate = parts[0];
                return tagDate >= weekAgo;
            }
            return false;
        });
        tags = tagLines.length;
        
        if (tags > 0) {
            colorLog(`🏷️  Tags created: ${tags}`, 'cyan');
            colorLog('Recent tags:', 'yellow');
            tagLines.forEach(tagLine => {
                console.log(`  ${tagLine}`);
            });
        } else {
            colorLog(`🏷️  Tags created: ${tags}`, 'cyan');
        }
    } else {
        colorLog(`🏷️  Tags created: ${tags}`, 'cyan');
    }
    
    // Получить общую статистику по репозиторию за неделю (все авторы)
    const totalStatsOutput = execGitCommand(
        `git log --since="${weekAgo}" --until="${today}" --numstat --pretty=format:""`,
        repoPath
    );
    
    let totalLinesAdded = 0;
    let totalLinesDeleted = 0;
    
    if (totalStatsOutput) {
        const totalLines = totalStatsOutput.split('\n').filter(line => line.trim() && !line.startsWith('commit'));
        totalLines.forEach(line => {
            const parts = line.split('\t');
            if (parts.length >= 2) {
                const added = parseInt(parts[0]) || 0;
                const deleted = parseInt(parts[1]) || 0;
                totalLinesAdded += added;
                totalLinesDeleted += deleted;
            }
        });
    }
    
    // Получить общее количество коммитов за неделю
    const totalCommitsOutput = execGitCommand(
        `git log --since="${weekAgo}" --until="${today}" --oneline`,
        repoPath
    );
    const totalCommits = totalCommitsOutput ? totalCommitsOutput.split('\n').filter(line => line.trim()).length : 0;
    
    // Получить количество уникальных участников за неделю
    const contributorsOutput = execGitCommand(
        `git log --since="${weekAgo}" --until="${today}" --format="%an" | sort | uniq`,
        repoPath
    );
    const totalContributors = contributorsOutput ? contributorsOutput.split('\n').filter(line => line.trim()).length : 0;
    
    // Вычислить мой вклад в процентах
    const myContribution = totalLinesAdded > 0 ? ((linesAdded / totalLinesAdded) * 100) : 0;
    
    console.log('\n---\n');
    
    return {
        commits,
        linesAdded,
        linesDeleted,
        filesChanged,
        tags,
        totalCommits,
        totalLinesAdded,
        totalLinesDeleted,
        totalContributors,
        myContribution
    };
}

// Функция для генерации markdown таблицы
function generateMarkdownTable(repositories, allStats, totalStats, weekAgo, today) {
    let markdown = `# Weekly Git Statistics Report\n\n`;
    markdown += `**Period:** ${weekAgo} to ${today}\n`;
    markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    
    // Основная таблица статистики
    markdown += `## Repository Statistics\n\n`;
    markdown += `| Repository | My Commits | My Lines +/- | Total Commits | Total Lines +/- | Contributors | My Contribution % |\n`;
    markdown += `|------------|------------|--------------|---------------|-----------------|--------------|-------------------|\n`;
    
    allStats.forEach((stats, index) => {
        const repo = repositories[index];
        const myNetChange = stats.linesAdded - stats.linesDeleted;
        const totalNetChange = stats.totalLinesAdded - stats.totalLinesDeleted;
        const myChangeStr = myNetChange >= 0 ? `+${myNetChange}` : `${myNetChange}`;
        const totalChangeStr = totalNetChange >= 0 ? `+${totalNetChange}` : `${totalNetChange}`;
        const contributionStr = stats.myContribution.toFixed(1);
        
        markdown += `| ${repo.name} | ${stats.commits} | +${stats.linesAdded}/-${stats.linesDeleted} (${myChangeStr}) | ${stats.totalCommits} | +${stats.totalLinesAdded}/-${stats.totalLinesDeleted} (${totalChangeStr}) | ${stats.totalContributors} | ${contributionStr}% |\n`;
    });
    
    // Общая статистика
    const myTotalNetChange = totalStats.linesAdded - totalStats.linesDeleted;
    const globalTotalNetChange = totalStats.totalLinesAdded - totalStats.totalLinesDeleted;
    const myTotalChangeStr = myTotalNetChange >= 0 ? `+${myTotalNetChange}` : `${myTotalNetChange}`;
    const globalTotalChangeStr = globalTotalNetChange >= 0 ? `+${globalTotalNetChange}` : `${globalTotalNetChange}`;
    const overallContribution = totalStats.totalLinesAdded > 0 ? ((totalStats.linesAdded / totalStats.totalLinesAdded) * 100) : 0;
    
    markdown += `| **TOTAL** | **${totalStats.commits}** | **+${totalStats.linesAdded}/-${totalStats.linesDeleted} (${myTotalChangeStr})** | **${totalStats.totalCommits}** | **+${totalStats.totalLinesAdded}/-${totalStats.totalLinesDeleted} (${globalTotalChangeStr})** | **${totalStats.totalContributors}** | **${overallContribution.toFixed(1)}%** |\n\n`;
    
    // Дополнительная статистика
    markdown += `## Summary\n\n`;
    markdown += `- **My Activity:**\n`;
    markdown += `  - Commits: ${totalStats.commits}\n`;
    markdown += `  - Files changed: ${totalStats.filesChanged}\n`;
    markdown += `  - Tags created: ${totalStats.tags}\n`;
    markdown += `  - Net code change: ${myTotalChangeStr} lines\n\n`;
    
    markdown += `- **Team Activity:**\n`;
    markdown += `  - Total commits: ${totalStats.totalCommits}\n`;
    markdown += `  - Total contributors: ${totalStats.totalContributors}\n`;
    markdown += `  - Total net change: ${globalTotalChangeStr} lines\n\n`;
    
    markdown += `- **My Contribution:**\n`;
    markdown += `  - Overall contribution to codebase changes: ${overallContribution.toFixed(1)}%\n`;
    markdown += `  - Average contribution per repository: ${(overallContribution / repositories.length).toFixed(1)}%\n\n`;
    
    // Активность по репозиториям
    markdown += `## Activity Breakdown\n\n`;
    allStats.forEach((stats, index) => {
        const repo = repositories[index];
        if (stats.commits > 0) {
            markdown += `### ${repo.name}\n`;
            markdown += `- My commits: ${stats.commits} (${((stats.commits / stats.totalCommits) * 100).toFixed(1)}% of total)\n`;
            markdown += `- My lines: +${stats.linesAdded}/-${stats.linesDeleted}\n`;
            markdown += `- Repository total: +${stats.totalLinesAdded}/-${stats.totalLinesDeleted}\n`;
            markdown += `- Contributors: ${stats.totalContributors}\n`;
            markdown += `- My contribution: ${stats.myContribution.toFixed(1)}%\n\n`;
        }
    });
    
    return markdown;
}

// Парсить файл repositories.md
function parseRepositoriesFile() {
    const scriptDir = __dirname;
    const repositoriesFile = path.join(scriptDir, 'repositories.md');
    
    if (!fs.existsSync(repositoriesFile)) {
        colorLog('❌ File repositories.md not found in scripts directory', 'red');
        process.exit(1);
    }
    
    const content = fs.readFileSync(repositoriesFile, 'utf-8');
    const lines = content.split('\n');
    const repositories = [];
    
    lines.forEach(line => {
        // Ищем строки вида "1. Huly.core: /path/to/repo"
        const match = line.match(/^(\d+)\.\s+([^:]+):\s+(.+)$/);
        if (match) {
            const repoName = match[2].trim();
            const repoPath = match[3].trim();
            repositories.push({ name: repoName, path: repoPath });
        }
    });
    
    return repositories;
}

// Основная функция
function main() {
    const weekAgo = getWeekAgoDate();
    const today = getTodayDate();
    
    colorLog('=== Git Statistics for the Last Week ===', 'cyan');
    colorLog(`Period: ${weekAgo} to ${today}`, 'cyan');
    colorLog('', 'reset');
    
    const repositories = parseRepositoriesFile();
    
    if (repositories.length === 0) {
        colorLog('❌ No repositories found in repositories.md', 'red');
        process.exit(1);
    }
    
    // Общие счетчики
    let totalStats = {
        commits: 0,
        linesAdded: 0,
        linesDeleted: 0,
        filesChanged: 0,
        tags: 0,
        totalCommits: 0,
        totalLinesAdded: 0,
        totalLinesDeleted: 0,
        totalContributors: 0
    };
    
    const allStats = [];
    
    // Обработать каждый репозиторий
    repositories.forEach(repo => {
        const stats = getRepoStats(repo.path, repo.name, weekAgo, today);
        allStats.push(stats);
        
        totalStats.commits += stats.commits;
        totalStats.linesAdded += stats.linesAdded;
        totalStats.linesDeleted += stats.linesDeleted;
        totalStats.filesChanged += stats.filesChanged;
        totalStats.tags += stats.tags;
        totalStats.totalCommits += stats.totalCommits;
        totalStats.totalLinesAdded += stats.totalLinesAdded;
        totalStats.totalLinesDeleted += stats.totalLinesDeleted;
        totalStats.totalContributors = Math.max(totalStats.totalContributors, stats.totalContributors);
    });
    
    // Показать общую статистику
    colorLog('=== 📊 TOTAL STATISTICS ===', 'cyan');
    colorLog(`📝 Total commits: ${totalStats.commits}`, 'green');
    colorLog(`➕ Total lines added: ${totalStats.linesAdded}`, 'green');
    colorLog(`➖ Total lines deleted: ${totalStats.linesDeleted}`, 'red');
    colorLog(`📄 Total files changed: ${totalStats.filesChanged}`, 'purple');
    colorLog(`🏷️  Total tags created: ${totalStats.tags}`, 'cyan');
    
    // Показать чистое изменение строк
    const netChange = totalStats.linesAdded - totalStats.linesDeleted;
    if (netChange >= 0) {
        colorLog(`📈 Net lines change: +${netChange}`, 'green');
    } else {
        colorLog(`📉 Net lines change: ${netChange}`, 'red');
    }
    
    console.log();
    colorLog(`Generated on: ${new Date().toLocaleString()}`, 'cyan');
    
    // Генерировать и сохранить markdown отчет
    const markdown = generateMarkdownTable(repositories, allStats, totalStats, weekAgo, today);
    const reportPath = path.join(__dirname, `weekly-report-${today}.md`);
    
    try {
        fs.writeFileSync(reportPath, markdown);
        colorLog(`\n📄 Markdown report saved to: ${reportPath}`, 'green');
    } catch (error) {
        colorLog(`\n❌ Failed to save markdown report: ${error.message}`, 'red');
    }
}

// Запустить скрипт
main();