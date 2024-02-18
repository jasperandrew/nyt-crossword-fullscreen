(function() {    
    if (window.hasNYTFullscreenRun) return; // Ensure this code only runs once
    window.hasNYTFullscreenRun = true;

    let qs = s => document.querySelector(s);
    let qsa = s => document.querySelectorAll(s);

    // https://stackoverflow.com/a/61511955
    const awaitNode = (selector, death) => {
        return new Promise(resolve => {
            const el = qs(selector);
            if (el && !death) return resolve(el);
            if (!el && death) return resolve(true);
    
            const observer = new MutationObserver(() => {
                const el = qs(selector);
                if (death) console.log(el);
                if (el && !death) {
                    observer.disconnect();
                    resolve(el);
                }
                if (!el && death) {
                    observer.disconnect();
                    resolve(true);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    };

    // DOM elements
    let container = '.pz-content',
        game = '#crossword-container',

        // Dynamic CSS stylesheets
        scaleStyle = document.head.appendChild(document.createElement('style')).sheet,
        fixStyle = document.head.appendChild(document.createElement('style')).sheet,
        posStyle = document.head.appendChild(document.createElement('style')).sheet,

        // State variables
        fullMode = false,
        ratio = 1;

    // Returns the given css string only if in fullscreen mode, otherwise returns the default
    let cssMap = {};
    let fullCSS = (sel, prop, val) => {
        let id = `${sel}|${prop}`;
        let els = qsa(sel);
        if (els.length === 0) return;
        if (!Object.keys(cssMap).includes(id)) {
            cssMap[id] = els[0].style[prop];
        }

        // this works for my purposes, but isn't ideal generally
        els.forEach(el => el.style[prop] = fullMode ? val : cssMap[id]);
    };

    // Calculates and applies the scale ratio for the game
    let render = () => {
        ratio = qs(container).clientHeight/qs(game).clientHeight;
        fullCSS(game, 'transform', `scale(${ratio})`);
        fullCSS(game, 'width', `calc(100vw / ${ratio})`);

        if (scaleStyle.cssRules.length > 0) scaleStyle.deleteRule(0);
        if (fullMode) scaleStyle.insertRule('.xwd__rebus--input {' + 
                                                `transform: scale(${1/ratio});` +
                                                `font-size: ${22 * ratio}px; }`);                    
    };

    // Toggles fullscreen mode
    let toggleFullscreen = () => {
        fullMode = !fullMode;
        fullCSS('header', 'display', 'none');
        fullCSS('.pz-game-title-bar', 'display', 'none');
        fullCSS('#portal-editorial-content', 'display', 'none');
        fullCSS('footer', 'display', 'none');
        fullCSS('body > div:first-of-type', 'height', '100vh');
        fullCSS('.pz-ad-box', 'display', 'none');

        fullCSS(container, 'height', '100%');
        fullCSS(container, 'display', 'flex');
        fullCSS(container, 'justifyContent', 'center');
        fullCSS(container, 'alignItems', 'center');
        
        fullCSS(game, 'marginTop', '0');
        fullCSS('.pz-game-toolbar', 'borderTop', 'none');

        if (fixStyle.cssRules.length > 0) fixStyle.deleteRule(0);
        if (fullMode) fixStyle.insertRule('.xwd__rebus--input { position: fixed; }');

        render();
    };
    
    // fix body height not being the full screen height
    document.body.style.height = '100vh';

    // Re-render on window resize
    window.onresize = render;

    // Stop the invisible rebus div and modal animations from changing the size of the page
    let overflowFix = document.head.appendChild(document.createElement('style')).sheet;
    overflowFix.insertRule('.xwd__rebus--invisible { display: none; }');
    overflowFix.insertRule('.xwd__rebus--input { text-align: center; }');
    overflowFix.insertRule('.pz-game-screen { overflow-y: hidden; }');

    awaitNode('.pz-game-toolbar > .pz-row').then(el => {
        // Fix the border on the toolbar
        let toolbar = el.style;
        toolbar.background = '#fff';
        toolbar.maxWidth = 'unset';
        toolbar.padding = '0 calc((100% - 1280px)/2)';
    });

    awaitNode('.xwd__toolbar--tools > div:nth-child(1)').then(el => {
        // Create the full-screen button
        let fullbtn = el.parentNode.insertBefore(el.cloneNode(true), el.nextSibling);
        fullbtn.querySelector('i').style.backgroundImage = `url('${chrome.runtime.getURL('fullscreen.svg')}')`;
        fullbtn.querySelector('button').addEventListener('click', toggleFullscreen);

        // Add a fullscreen button to the pause modal
        fullbtn = fullbtn.cloneNode(true);
        fullbtn.style.position = 'absolute';
        fullbtn.style.top = '10px';
        fullbtn.style.left = '10px';
        fullbtn.querySelector('button').style.borderRadius = '4px';
        let icon = fullbtn.querySelector('i').style;
        icon.filter = 'grayscale(1) brightness(0.4)';
        icon.backgroundColor = 'unset';
        
        let addModalBtn = (el) => {
            el.appendChild(fullbtn.cloneNode(true))
                .querySelector('button').addEventListener('click', toggleFullscreen);

            awaitNode('.xwd__modal--content', true).then(() => {
                awaitNode('.xwd__modal--content').then(el => addModalBtn(el));
            });
        };

        // addBtn();
        awaitNode('.xwd__modal--content').then(el => addModalBtn(el));
    });

    // Adjusts the rebus mode CSS to work in fullscreen
    let fixRebus = (el) => {
        let cell = qs('.xwd__cell--selected').getBoundingClientRect();
        let w = cell.width, t = cell.top, l = cell.left,
        r = 1/ratio;
        
        if (posStyle.cssRules.length > 0) posStyle.deleteRule(0);
        if (fullMode) posStyle.insertRule('.xwd__rebus--input {' + 
        `top: ${-1 * (w - w * r)/2 + t * r}px !important;` +
        `left: ${-1 * (w - w * r)/2 + l * r}px !important; }`);

        awaitNode('.xwd__rebus--input', true).then(() => {
            awaitNode('.xwd__rebus--input').then(el => fixRebus(el));
        });
    };

    awaitNode('.xwd__rebus--input').then(el => fixRebus(el));
})();