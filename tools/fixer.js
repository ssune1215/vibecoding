const fs = require('fs');
const path = require('path');

function fix() {
    const rootDir = path.join(__dirname, '..');
    const dirs = fs.readdirSync(rootDir, {withFileTypes: true})
        .filter(d => d.isDirectory())
        .map(d => d.name)
        .filter(name => !['assets', 'tools', '.git'].includes(name))
        .filter(name => fs.existsSync(path.join(rootDir, name, 'index.html')));

    for(let name of dirs) {
        const filePath = path.join(rootDir, name, 'index.html');
        let html = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 1. Add shuffle array function if completely missing
        if (!html.includes('function shuffle(array)')) {
            const shuffleFunc = `
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
`;
            // insert before startTest
            html = html.replace('function startTest() {', shuffleFunc + '\n    function startTest() {');
            modified = true;
        }

        // 2. Add shuffle(q.options) if missing but shuffle(questions) exists, OR if missing completely
        // First check inside startTest block
        const startTestRegex = /function startTest\(\)\s*\{([\s\S]*?)document\.getElementById\('start-area'\)\.style\.display/m;
        const match = html.match(startTestRegex);
        if (match) {
            let startTestBody = match[1];
            let newBody = startTestBody;

            // If it's a simulation/date, we MUST NOT shuffle(questions), but we CAN shuffle options.
            if (name.includes('simulation')) {
                // remove shuffle(questions) if it exists
                newBody = newBody.replace(/shuffle\(questions\);\s*/g, '');
                // ensure shuffle(q.options) exists
                if (!newBody.includes('q.options')) {
                    newBody = '        questions.forEach(q => shuffle(q.options));\n' + newBody;
                }
            } else {
                // standard tests should shuffle questions and options
                if (!newBody.includes('shuffle(questions)')) {
                    newBody = '        shuffle(questions);\n' + newBody;
                }
                if (!newBody.includes('q.options')) {
                    newBody = newBody.replace('shuffle(questions);', 'shuffle(questions);\n        questions.forEach(q => shuffle(q.options));');
                }
            }

            if (startTestBody !== newBody) {
                html = html.replace(startTestBody, newBody);
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, html, 'utf8');
            console.log(`[FIXED] ${name}/index.html`);
        } else {
            console.log(`[OK] ${name}/index.html`);
        }
    }
}

fix();
