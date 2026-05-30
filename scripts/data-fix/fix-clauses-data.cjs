const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'hsc-clauses-phrases-04.json'), 'utf-8'));

// ═══════════════════════════════════════════════════════════
// 1. FIX DATA BUGS
// ═══════════════════════════════════════════════════════════
data.forEach(set => {
    set.items.forEach(item => {
        if (!item.question_text) {
            item.question_text = item.context;
            item.context = '';
        }
    });
});
data.forEach(set => {
    set.items.forEach(item => {
        const opts = item.options || [];
        if (!opts.includes(item.correct_answer)) {
            const correct = item.correct_answer;
            let bestIdx = 0, bestOverlap = 1;
            opts.forEach((opt, i) => {
                const ov = wordOverlap(correct, opt);
                if (ov < bestOverlap) { bestOverlap = ov; bestIdx = i; }
            });
            opts.splice(bestIdx, 1, correct);
        }
    });
});
function wordOverlap(a, b) {
    const sa = new Set(a.toLowerCase().split(/\s+/));
    const sb = new Set(b.toLowerCase().split(/\s+/));
    return [...sa].filter(x => sb.has(x)).length / new Set([...sa, ...sb]).size;
}

// ═══════════════════════════════════════════════════════════
// 2. PATTERN DETECTION
// ═══════════════════════════════════════════════════════════
function pattern(item) {
    const t = ' ' + (item.context + ' ' + item.question_text).toLowerCase().replace(/\s+/g, ' ') + ' ';
    if (/ lest /.test(t)) return 'lest';
    if (/ high time /.test(t)) return 'high_time';
    if (/ as if | as though /.test(t)) return 'as_if';
    if (/ would rather /.test(t)) return 'would_rather';
    if (/ so that /.test(t)) return 'so_that';
    if (/ in order that /.test(t)) return 'in_order_that';
    if (/ unless /.test(t)) return 'unless';
    if (/ provided /.test(t)) return 'provided';
    if (/ until /.test(t)) return 'until';
    if (/ since /.test(t)) return 'since';
    if (/ though | although /.test(t)) return 'though';
    if (/ let alone /.test(t)) return 'let_alone';
    if (/ with a view to /.test(t)) return 'with_a_view_to';
    if (/ (no sooner|hardly|scarcely) had /.test(t)) return 'inversion';
    if (/ there goes a proverb|a proverb goes /.test(t)) return 'proverb';
    if (/ he who | he that /.test(t)) return 'relative';
    if (/ would you mind /.test(t)) return 'would_you_mind';
    if (/ do you know (where|what|when|how|who|why) /.test(t)) return 'wh';
    if (/ what does |what's |what is /.test(t)) return 'wh';
    // Conditional detection
    const ifMatch = t.match(/ if (\w+(?:\s+\w+){0,5})/);
    if (ifMatch) {
        const afterIf = ifMatch[1];
        if (/\b(were|had|knew|studied|could|did|wanted|lived|found|understood|taught|stopped|loved|wished|asked|began|spoke)\b/.test(afterIf))
            return 'conditional_2';
        return 'conditional_1';
    }
    return 'other';
}

function isNounish(s) {
    const t = s.toLowerCase().trim();
    if (/^(the|a|an) /.test(t)) return true;
    if (/^[a-z]+$/i.test(t) && !/\b(am|is|are|was|were|have|has|had|do|does|did|will|shall|can|could|may|might|must|would|should)\b/i.test(t)) return true;
    return false;
}

// ═══════════════════════════════════════════════════════════
// 3. GENERATE DISTRACTOR EXPLANATIONS
// ═══════════════════════════════════════════════════════════
data.forEach(set => {
    set.items.forEach(item => {
        const opts = item.options || [];
        const correct = item.correct_answer;
        const wrongs = opts.filter(o => o !== correct);
        const full = (item.context + ' ' + item.question_text).replace(/\s+/g, ' ').trim();
        const p = pattern(item);

        const distractors = [];

        wrongs.forEach(w => {
            let reasons = [];

            switch (p) {
                case 'lest':
                    if (!w.toLowerCase().includes('should'))
                        reasons.push('After the conjunction "lest", the following verb must be preceded by "should". This option omits "should".');
                    else
                        reasons.push('Does not express the logical consequence that "lest" warns against in this context.');
                    break;

                case 'high_time':
                    if (isPastForm(w))
                        reasons.push('Does not complete the "It is high time" construction naturally for this particular context.');
                    else
                        reasons.push('After "It is high time", the verb must take the past subjunctive form. This is not in the past tense.');
                    break;

                case 'as_if':
                    if (/\bwere\b/.test(correct) && !/\bwere\b/.test(w))
                        reasons.push('After "as if/as though", use the subjunctive "were" for unreal/hypothetical present situations.');
                    else
                        reasons.push('Does not correctly express the hypothetical comparison implied by "as if/as though" here.');
                    break;

                case 'conditional_1':
                    if (!/\b(will|can|may|shall)\b/.test(w) && /\b(will|can)\b/.test(correct))
                        reasons.push('This is a Type 1 conditional (If + present tense). The main clause needs "will/can/may" + base verb.');
                    else if (/\bwould\b/.test(w))
                        reasons.push('Type 1 conditional uses "will" in the main clause, not "would" (which belongs to Type 2).');
                    else
                        reasons.push('Does not logically complete this Type 1 conditional sentence for the given context.');
                    break;

                case 'conditional_2':
                    if (!/\b(would|could)\b/.test(w))
                        reasons.push('This is a Type 2 conditional (If + past subjunctive). The main clause needs "would/could" + base verb.');
                    else if (/\bwill\b/.test(w))
                        reasons.push('Type 2 conditional uses "would" in the main clause, not "will".');
                    else
                        reasons.push('Does not logically complete this conditional thought for the context.');
                    break;

                case 'so_that':
                case 'in_order_that':
                    if (!/\b(may|might|can|could|will|would)\b/.test(w))
                        reasons.push('After "' + p.replace('_', ' ') + '", a purpose clause needs a modal verb (may/might/can/could).');
                    else
                        reasons.push('Does not match the specific purpose expressed in the context.');
                    break;

                case 'unless':
                    reasons.push(rulesUnless(w));
                    break;

                case 'until':
                    reasons.push(rulesUntil(w));
                    break;

                case 'since':
                    reasons.push('Does not correctly express the cause-effect relationship introduced by "Since".');
                    break;

                case 'though':
                    reasons.push('Does not create the expected contrast that "though/although" signals.');
                    break;

                case 'let_alone':
                    reasons.push(rulesLetAlone(w));
                    break;

                case 'would_you_mind':
                    reasons.push(rulesGerundAfter('Would you mind', w));
                    break;

                case 'with_a_view_to':
                    reasons.push(rulesGerundAfter('with a view to', w));
                    break;

                case 'inversion':
                    reasons.push('The inverted structure (Hardly/No sooner...when/than) requires correct auxiliary placement.');
                    break;

                case 'proverb':
                    reasons.push('This is not the standard form of this well-known English proverb.');
                    break;

                case 'relative':
                    reasons.push('Does not correctly complete the relative clause for this context.');
                    break;

                case 'wh':
                    reasons.push('Does not correctly answer the question implied by the context.');
                    break;

                default: {
                    // OTHER — conservative analysis, only say things we're sure about
                    if (isNounish(correct) && isNounish(w)) {
                        // Both are noun phrases — minimal info
                        reasons.push('Does not match the specific context. The correct answer is the appropriate term/phrase here.');
                    } else {
                        // Check for model violation
                        const wHead = w.toLowerCase().split(/\s+/).slice(0, 3).join(' ');
                        const cHead = correct.toLowerCase().split(/\s+/).slice(0, 3).join(' ');

                        // Pronoun mismatch with context
                        const ctxPro = pronoun(full);
                        const wPro = pronoun(w);
                        if (wPro && ctxPro && wPro !== ctxPro) {
                            reasons.push(`Uses "${wPro}" but the context refers to "${ctxPro}".`);
                        }

                        // Negation mismatch
                        if (!reasons.length) {
                            const cNeg = /\b(not|n't|never|no)\b/.test(correct);
                            const wNeg = /\b(not|n't|never|no)\b/.test(w);
                            if (cNeg !== wNeg)
                                reasons.push(cNeg ? 'The context requires a negative construction.' : 'The context requires a positive (affirmative) construction.');
                        }

                        if (!reasons.length)
                            reasons.push('Does not match the expected completion based on the context provided.');
                    }
                }
            }

            distractors.push({ option: w, reason: reasons.join(' ') });
        });

        item.explanation_distractors = distractors;
    });
});

// Helper functions
function isPastForm(s) {
    const t = s.toLowerCase().split(/\s+/);
    return t.some(word => /\w+ed$/.test(word)) ||
        /\b(told|left|sent|began|broke|built|bought|caught|chose|drove|drank|fell|flew|forgot|froze|gave|grew|hid|kept|knew|led|lost|made|met|paid|put|ran|said|saw|sold|sent|set|shut|sang|sank|sat|slept|spoke|spent|stood|stole|struck|swam|swore|swept|swung|took|taught|tore|thought|threw|understood|woke|won|wore|wrote)\b/.test(s);
}

function pronoun(s) {
    const m = s.toLowerCase().match(/\b(i|you|he|she|it|we|they)\b/);
    return m ? m[0] : null;
}

function rulesUnless(w) {
    if (/\bwill\b/.test(w.toLowerCase()) || /\bshall\b/.test(w.toLowerCase()))
        return 'After "unless", use the present tense to refer to future time (not "will"/"shall").';
    return 'Does not express the conditional relationship introduced by "unless".';
}

function rulesUntil(w) {
    if (/\bwill\b/.test(w.toLowerCase()) || /\bshall\b/.test(w.toLowerCase()))
        return 'After "until", use the present tense (not "will") to refer to future time.';
    return 'Does not express the time relationship introduced by "until".';
}

function rulesLetAlone(w) {
    if (!/\b(not|n't|never|no|none|neither|hardly|scarcely)\b/.test(w.toLowerCase()))
        return '"Let alone" requires a preceding negative clause. This option is affirmative, not negative.';
    return 'Does not correctly pair with "let alone" to express the intended contrast.';
}

function rulesGerundAfter(prefix, w) {
    const t = w.toLowerCase();
    if (!/\b\w+ing\b/.test(t) || /thing|bring|sing|ring|spring|swing|fling|cling|sting/i.test(t))
        return `After "${prefix}", the verb must take the -ing form (gerund).`;
    return 'Does not appropriately complete the sentence for this context.';
}

// ═══════════════════════════════════════════════════════════
// 4. WRITE OUTPUT & REPORT
// ═══════════════════════════════════════════════════════════
const outPath = path.join(__dirname, '..', 'public', 'hsc', 'clauses-phrases-04.json');
fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');

const all = data.flatMap(s => s.items);
const pc = {};
all.forEach(i => { const p = pattern(i); pc[p] = (pc[p] || 0) + 1; });
console.log('Written to:', outPath);
console.log('Total:', all.length);
console.log('Patterns:', Object.entries(pc).sort((a,b) => b[1]-a[1]).map(([k,v]) => `${k}:${v}`).join(', '));

// Show 12 samples including previously problematic ones
const check = [
    [ 'set_1', 'a' ], [ 'set_1', 'd' ], [ 'set_1', 'e' ], [ 'set_1', 'g' ],
    [ 'set_1', 'j' ], [ 'set_2', 'a' ], [ 'set_2', 'c' ], [ 'set_6', 'a' ],
    [ 'set_8', 'h' ], [ 'set_3', 'd' ], [ 'set_5', 'd' ], [ 'set_2', 'e' ],
];
console.log();
check.forEach(([sid, iid]) => {
    const s = data.find(x => x.id === sid);
    if (!s) return;
    const item = s.items.find(x => x.item === iid);
    if (!item) return;
    console.log(`=== ${sid} ${iid} [${pattern(item)}] ===`);
    console.log('Q:', (item.question_text || '').substring(0, 60));
    console.log('Correct:', item.correct_answer);
    (item.explanation_distractors || []).forEach(d =>
        console.log('  ✗ "' + d.option.substring(0, 42) + '" → ' + d.reason));
    console.log();
});
