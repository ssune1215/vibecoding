const fs = require('fs');
const path = require('path');

function audit() {
    const rootDir = path.join(__dirname, '..');
    const dirs = fs.readdirSync(rootDir, {withFileTypes: true})
        .filter(d => d.isDirectory())
        .map(d => d.name)
        .filter(name => !['assets', 'tools', '.git', 'css', 'js'].includes(name))
        .filter(name => fs.existsSync(path.join(rootDir, name, 'index.html')));

    const report = [];

    for(let name of dirs) {
        const filePath = path.join(rootDir, name, 'index.html');
        const html = fs.readFileSync(filePath, 'utf8');
        
        const hasShuffleDef = html.includes('function shuffle(array)');
        const callsShuffleQ = html.includes('shuffle(questions)');
        const callsShuffleOpt = html.includes('shuffle(q.options)') || html.includes('shuffle(opt)');
        
        const isSimulation = name.includes('simulation') || name.includes('date');
        
        let maxOptLen = 0;
        let optionsFound = 0;
        let optLengths = [];
        
        // Match { text: "..." }
        const regex = /\{\s*text:\s*["']([^"']+)["']/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            const t = match[1];
            optionsFound++;
            optLengths.push(t.length);
            if (t.length > maxOptLen) maxOptLen = t.length;
        }

        const avgOptLen = optionsFound > 0 ? (optLengths.reduce((a,b)=>a+b,0) / optionsFound).toFixed(1) : 0;
        
        const hasReplaceBr = html.includes('replace(/\\n/g, \'<br>\')') || html.includes('replace(\'\\n\', \'<br>\')');
        const hasNameN = html.includes('\\n') && html.includes('name:');

        // Check if point logic exists
        const hasPoints = html.includes('point:') || html.includes('point :');
        const hasTypes = html.includes('type:');
        
        report.push({
            test: name,
            hasShuffleDef,
            callsShuffleQ,
            callsShuffleOpt,
            isSimulation,
            maxOptLen,
            avgOptLen,
            hasReplaceBr,
            hasNameN,
            logic: hasPoints ? 'point' : (hasTypes ? 'mbti' : 'unknown')
        });
    }

    console.log(JSON.stringify(report, null, 2));
}

audit();
