const searchForm = document.getElementById('searchForm');
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const resultsSection = document.getElementById('resultsSection');
        const exampleTags = document.querySelectorAll('.example-tag');

        // Using the free unofficial Urban Dictionary API
        const API_BASE_URL = 'https://unofficialurbandictionaryapi.com/api';
        
        let currentDefinitions = [];
        let showingAll = false;

        // Add click handlers for example tags
        exampleTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const term = tag.getAttribute('data-term');
                searchInput.value = term;
                searchDefinition(term);
            });
        });

        // Handle form submission
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const term = searchInput.value.trim();
            if (term) {
                searchDefinition(term);
            }
        });

        // Search function
        async function searchDefinition(term) {
            // Show loading state
            searchBtn.disabled = true;
            searchBtn.innerHTML = '⏳ Searching...';
            
            resultsSection.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    Looking up "${term}" in the streets...
                </div>
            `;

            try {
                const response = await fetch(`${API_BASE_URL}?term=${encodeURIComponent(term)}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('API Response:', data); // Debug log
                displayResults(data, term);

            } catch (error) {
                console.error('Error fetching definition:', error);
                displayError(term, error.message);
            } finally {
                // Reset button state
                searchBtn.disabled = false;
                searchBtn.innerHTML = '🔍 Search';
            }
        }

        // Display results
        function displayResults(data, term) {
            console.log('Processing data:', data); // Debug log
            
            // Handle different possible response formats
            let definitions = [];
            
            if (data && Array.isArray(data)) {
                definitions = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                definitions = data.data;
            } else if (data && data.definitions && Array.isArray(data.definitions)) {
                definitions = data.definitions;
            } else if (data && data.list && Array.isArray(data.list)) {
                definitions = data.list;
            }

            if (definitions.length === 0) {
                resultsSection.innerHTML = `
                    <div class="no-results">
                        <h3>No definition found for "${term}"</h3>
                        <p>Try searching for a different term or check the spelling.</p>
                    </div>
                `;
                return;
            }

            currentDefinitions = definitions;
            showingAll = false;
            renderDefinitions();
        }

        // Render definitions
        function renderDefinitions() {
            const definitionsToShow = showingAll ? currentDefinitions : currentDefinitions.slice(0, 1);
            
            let resultHTML = '';
            
            definitionsToShow.forEach((definition, index) => {
                // Handle different property names from different APIs
                const word = definition.word || definition.term || term;
                const meaning = definition.meaning || definition.definition || definition.text || 'No definition available';
                const example = definition.example || definition.usage || '';
                const upvotes = definition.upvotes || definition.thumbs_up || definition.ups || 0;
                const downvotes = definition.downvotes || definition.thumbs_down || definition.downs || 0;
                const author = definition.author || definition.contributor || 'Anonymous';
                const date = definition.date || definition.written_on || '';
                
                resultHTML += `
                    <div class="definition-card">
                        <h2 class="term-title">${escapeHtml(word)}</h2>
                        <div class="definition-text">${escapeHtml(meaning)}</div>
                        ${example ? `
                            <div class="example-text">
                                <strong>Example:</strong> ${escapeHtml(example)}
                            </div>
                        ` : ''}
                        <div class="stats">
                            <div class="stat">
                                <span>👍</span>
                                <span>${upvotes} likes</span>
                            </div>
                            <div class="stat">
                                <span>👎</span>
                                <span>${downvotes} dislikes</span>
                            </div>
                            <div class="stat">
                                <span>👤</span>
                                <span>By ${escapeHtml(author)}</span>
                            </div>
                            ${date ? `
                                <div class="stat">
                                    <span>📅</span>
                                    <span>${formatDate(date)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            });

            // Add show more button if there are more definitions
            if (!showingAll && currentDefinitions.length > 1) {
                resultHTML += `
                    <div class="multiple-definitions">
                        <button class="show-more-btn" onclick="toggleShowAll()">
                            Show ${currentDefinitions.length - 1} More Definition${currentDefinitions.length > 2 ? 's' : ''}
                        </button>
                    </div>
                `;
            } else if (showingAll && currentDefinitions.length > 1) {
                resultHTML += `
                    <div class="multiple-definitions">
                        <button class="show-more-btn" onclick="toggleShowAll()">
                            Show Less
                        </button>
                    </div>
                `;
            }

            resultsSection.innerHTML = resultHTML;
        }

        // Toggle show all definitions
        function toggleShowAll() {
            showingAll = !showingAll;
            renderDefinitions();
        }

        // Display error
        function displayError(term, errorMessage) {
            resultsSection.innerHTML = `
                <div class="error">
                    <h3>Oops! Something went wrong</h3>
                    <p>Couldn't fetch definition for "${term}"</p>
                    <p><small>Error: ${errorMessage}</small></p>
                    <p><small>The API might be temporarily unavailable. Please try again later.</small></p>
                </div>
            `;
        }

        // Utility function to format date
        function formatDate(dateString) {
            if (!dateString) return '';
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString();
            } catch (e) {
                return dateString;
            }
        }

        // Utility function to escape HTML
        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Add some flair with random background colors for graffiti
        function randomizeGraffiti() {
            const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ffd93d'];
            const graffitis = document.querySelectorAll('.graffiti-bg');
            
            graffitis.forEach(graffiti => {
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                graffiti.style.color = randomColor;
            });
        }

        // Initialize
        randomizeGraffiti();
        setInterval(randomizeGraffiti, 10000); // Change colors every 10 seconds

        // Make toggleShowAll available globally
        window.toggleShowAll = toggleShowAll;