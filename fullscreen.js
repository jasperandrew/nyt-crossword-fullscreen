(function() {
    try {
        if (window.hasRun) return;
        window.hasRun = true;
        
        let qs = s => document.querySelector(s);

        let run = () => {
            let container = qs('.pz-content'),
                game = qs('#crossword-container'),

                scaleStyle = document.head.appendChild(document.createElement('style')).sheet,
                fixStyle = document.head.appendChild(document.createElement('style')).sheet,
                posStyle = document.head.appendChild(document.createElement('style')).sheet,

                fullMode = false,
                css = s => fullMode ? s : 'inherit',

                ratio = 1,
                render = () => {
                    ratio = container.clientHeight/game.clientHeight;
                    game.style.transform = css(`scale(${ratio})`);
                    game.style.width = css(`calc(100vw / ${ratio})`);

                    if (scaleStyle.cssRules.length > 0) scaleStyle.deleteRule(0);
                    if (fullMode) scaleStyle.insertRule('.xwd__rebus--input {' + 
                                                            `transform: scale(${1/ratio});` +
                                                            `font-size: ${22 * ratio}px; }`);                    
                };

            // Stop the invisible rebus div from changing the size of the page
            document.head.appendChild(document.createElement('style'))
                .sheet.insertRule('.xwd__rebus--invisible { display: none; }');

            // Fix the border on the toolbar
            let toolbar = qs('.pz-game-toolbar > .pz-row').style;
            toolbar.background = '#fff';
            toolbar.maxWidth = 'unset';
            toolbar.padding = '0 calc((100% - 1280px)/2)';

            // Get rid of the tooltip on the grid
            qs('#boardTitle').innerHTML = '';

            // Re-render on window resize
            window.onresize = render;

            // Create the full-screen button
            let toolbtn = qs('.xwd__toolbar--tools > div:nth-child(1)'),
                fullbtn = toolbtn.parentNode.insertBefore(toolbtn.cloneNode(true), toolbtn.nextSibling);

            fullbtn.querySelector('i').style.backgroundImage = `url('https://www.jasperandrew.me/nyt-crossword-fullscreen/fullscreen.svg')`;
            fullbtn.querySelector('button').addEventListener('click', () => {
                fullMode = !fullMode;
                qs('.pz-game-title-bar').style.display = css('none');
                qs('#portal-editorial-content').style.display = css('none');
                qs('footer').style.display = css('none');
                qs('.messaging-hasbro-no-extra').style.height = css('calc(100vh - 65px)');
                
                container.style.height = css('100%');
                container.style.display = css('flex');
                container.style.justifyContent = container.style.alignItems = css('center');
                
                game.style.marginTop = css('0');

                if (fixStyle.cssRules.length > 0) fixStyle.deleteRule(0);
                if (fullMode) fixStyle.insertRule('.xwd__rebus--input { position: fixed; }');

                render();
            });

            // Modify the position of the rebus box
            qs('.xwd__tool--texty > button').addEventListener('click', () => {
                new MutationObserver(() => {
                    let cell = qs('.xwd__cell--selected').getBoundingClientRect();
                    let w = cell.width, t = cell.top, l = cell.left,
                        r = 1/ratio;

                    if (posStyle.cssRules.length > 0) posStyle.deleteRule(0);
                    if (fullMode) posStyle.insertRule('.xwd__rebus--input {' + 
                                        `top: ${-1 * (w - w * r)/2 + (t - 65) * r}px !important;` +
                                        `left: ${-1 * (w - w * r)/2 + l * r}px !important; }`);
                }).observe(qs('.xwd__layout_container > div:first-child'), { childList: true });
            });
        };

        new MutationObserver(run).observe(qs('.pz-game-field'), { childList: true });
    } catch(e) {
        console.log(e);
    }
})();