(function () {
    function esc(str) {
        return (str || '').replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
    }

    async function fetchJson(path) {
        try {
            const res = await fetch(path);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null;
        }
    }

    function scoreEntry(query, text) {
        const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
        const hay = text.toLowerCase();
        return tokens.reduce((sum, token) => sum + (hay.includes(token) ? 1 : 0), 0);
    }

    function initAssistant(knowledge) {
        const button = document.createElement('button');
        button.className = 'ai-chat-toggle';
        button.type = 'button';
        button.textContent = 'Ask Lighthouse AI';

        const panel = document.createElement('div');
        panel.className = 'ai-chat-panel';
        panel.innerHTML = `
            <div class="ai-chat-header">Lighthouse AI Assistant</div>
            <div class="ai-chat-messages" id="ai-chat-messages">
                <div class="ai-msg ai-msg-bot">Hello 👋 I can help with service times, location, prayer, counselling, and next steps.</div>
            </div>
            <div class="ai-chat-input-row">
                <input id="ai-chat-input" type="text" placeholder="Ask a question..." />
                <button id="ai-chat-send" type="button">Send</button>
            </div>
        `;

        document.body.appendChild(button);
        document.body.appendChild(panel);

        const messages = panel.querySelector('#ai-chat-messages');
        const input = panel.querySelector('#ai-chat-input');
        const send = panel.querySelector('#ai-chat-send');

        button.addEventListener('click', () => panel.classList.toggle('open'));

        function respond() {
            const query = input.value.trim();
            if (!query) return;

            messages.insertAdjacentHTML('beforeend', `<div class="ai-msg ai-msg-user">${esc(query)}</div>`);

            const best = knowledge
                .map(entry => ({ ...entry, score: scoreEntry(query, `${entry.title} ${entry.text}`) }))
                .sort((a, b) => b.score - a.score)[0];

            let answer;
            if (!best || best.score === 0) {
                answer = 'I could not find that in church resources. Please use Contact, Prayer, or Counselling and a leader will help you.';
            } else {
                answer = `${best.text} <a href="${best.url}">Open page</a>.`;
            }

            messages.insertAdjacentHTML('beforeend', `<div class="ai-msg ai-msg-bot">${answer}</div>`);
            messages.scrollTop = messages.scrollHeight;
            input.value = '';
        }

        send.addEventListener('click', respond);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') respond();
        });
    }

    function initNextStepRecommendations() {
        const btn = document.getElementById('ai-next-step-btn');
        const stage = document.getElementById('ai_life_stage');
        const need = document.getElementById('ai_need');
        const result = document.getElementById('ai-next-step-result');
        if (!btn || !stage || !need || !result) return;

        const recommendations = {
            new: { learning: ['membershipclass.html', 'Start with E-Membership and join membership class.'], prayer: ['prayer.html', 'Submit a prayer request and ask for a follow-up call.'] },
            growing: { community: ['groups.html', 'Join a growth group to build accountability.'], learning: ['faq.html', 'Review FAQs and discipleship pathways.'] },
            serving: { community: ['groups.html', 'Explore ministry teams where you can serve.'], counselling: ['counselling.html', 'Book a session to align gifts and calling.'] },
            family: { counselling: ['counselling.html', 'Book family counselling support.'], prayer: ['prayer.html', 'Share your family prayer requests with the prayer team.'] }
        };

        btn.addEventListener('click', () => {
            const stageMap = recommendations[stage.value] || {};
            const [url, message] = stageMap[need.value] || ['contact.html', 'Please contact the church team for a personalized path.'];
            result.innerHTML = `${esc(message)} <a href="${url}">Continue</a>.`;
        });
    }

    function detectUrgency(text) {
        const urgentTerms = ['suicide', 'self-harm', 'abuse', 'danger', 'hospital', 'urgent', 'panic'];
        const lower = (text || '').toLowerCase();
        return urgentTerms.some(term => lower.includes(term));
    }

    function detectCategory(text, fallback) {
        const lower = (text || '').toLowerCase();
        const map = [
            ['grief', ['loss', 'bereavement', 'funeral', 'grief']],
            ['family', ['family', 'marriage', 'children', 'spouse']],
            ['health', ['healing', 'sick', 'health', 'pain']],
            ['finance', ['job', 'debt', 'money', 'finance', 'business']],
            ['spiritual', ['faith', 'prayer', 'salvation', 'spiritual']]
        ];

        for (const [category, words] of map) {
            if (words.some(w => lower.includes(w))) return category;
        }
        return fallback || 'general';
    }

    function initTriage() {
        document.querySelectorAll('form[data-ai-triage]').forEach(form => {
            form.addEventListener('submit', () => {
                const textField = form.querySelector('textarea');
                const text = textField ? textField.value : '';
                const category = detectCategory(text, form.dataset.aiDefault);
                const urgent = detectUrgency(text);

                let catInput = form.querySelector('input[name="ai_category"]');
                if (!catInput) {
                    catInput = document.createElement('input');
                    catInput.type = 'hidden';
                    catInput.name = 'ai_category';
                    form.appendChild(catInput);
                }
                catInput.value = category;

                let urgencyInput = form.querySelector('input[name="ai_urgency"]');
                if (!urgencyInput) {
                    urgencyInput = document.createElement('input');
                    urgencyInput.type = 'hidden';
                    urgencyInput.name = 'ai_urgency';
                    form.appendChild(urgencyInput);
                }
                urgencyInput.value = urgent ? 'high' : 'normal';

                const output = form.querySelector('.ai-triage-output');
                if (output) {
                    output.innerHTML = `AI triage: <strong>${esc(category)}</strong> | priority: <strong>${urgent ? 'high' : 'normal'}</strong>.`;
                }

                if (urgent) {
                    alert('Your message looks urgent. Please also call emergency services if anyone is in immediate danger.');
                }
            });
        });
    }

    function renderSermons(sermons, query) {
        const q = (query || '').trim().toLowerCase();
        return sermons.filter(s => {
            if (!q) return true;
            return `${s.title} ${s.topic} ${s.summary} ${s.scriptures.join(' ')}`.toLowerCase().includes(q);
        });
    }

    function initSermonHub(data) {
        const input = document.getElementById('sermon-search');
        const results = document.getElementById('sermon-results');
        if (!input || !results || !data) return;

        function draw(query) {
            const items = renderSermons(data, query);
            results.innerHTML = items.map(item => `
                <article class="ai-sermon-card">
                    <h3>${esc(item.title)}</h3>
                    <p><strong>Topic:</strong> ${esc(item.topic)}</p>
                    <p>${esc(item.summary)}</p>
                    <p><strong>Scriptures:</strong> ${esc(item.scriptures.join(', '))}</p>
                    <a href="${item.watchUrl}" target="_blank" rel="noopener">Watch</a>
                </article>
            `).join('') || '<p>No sermon matches found.</p>';
        }

        draw('');
        input.addEventListener('input', () => draw(input.value));
    }

    function initContentCopilot() {
        const form = document.getElementById('ai-content-copilot-form');
        const output = document.getElementById('ai-content-output');
        if (!form || !output) return;

        form.setAttribute('data-ai-managed', 'true');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const sermon = document.getElementById('copilot-sermon').value.trim();
            const scripture = document.getElementById('copilot-scripture').value.trim();
            const audience = document.getElementById('copilot-audience').value;

            output.innerHTML = `
                <h3>Draft Bulletin</h3>
                <p>This week at Lighthouse Parish, we are reflecting on <strong>${esc(sermon)}</strong> from <strong>${esc(scripture)}</strong>. Join us as we grow together in faith.</p>
                <h3>Social Caption</h3>
                <p>${esc(sermon)} | ${esc(scripture)} — God is still moving in our church family. Invite someone this week. #LighthouseParish</p>
                <h3>Email Intro (${esc(audience)})</h3>
                <p>Dear ${esc(audience)}, grace and peace. This week we focus on ${esc(sermon)} (${esc(scripture)}). Come expectant and bring a friend.</p>
            `;
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const kb = await fetchJson('data/knowledge-base.json');
        if (kb && Array.isArray(kb.entries)) {
            initAssistant(kb.entries);
        }

        const sermons = await fetchJson('data/sermons.json');
        if (sermons && Array.isArray(sermons.sermons)) {
            initSermonHub(sermons.sermons);
        }

        initNextStepRecommendations();
        initTriage();
        initContentCopilot();
    });
})();
