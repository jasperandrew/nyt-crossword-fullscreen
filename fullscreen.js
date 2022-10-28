(function() {
    if (window.hasRun) return;
    window.hasRun = true;
    
    new MutationObserver(() => {
        let q = s => document.querySelector(s),
        e = q('.xwd__toolbar--tools > div:nth-child(1)'),
        d = e.cloneNode(true),
        s = q('.pz-game-toolbar > .pz-row').style,
        r = 1,
        f = false,
        c = s => f ? s : 'inherit';

        s.background = '#fff';
        s.maxWidth = 'unset';
        s.padding = '0 calc((100% - 1280px)/2)';

        try {
            console.log(browser.runtime.getUrl('fullscreen.svg'));
        } catch(e) {
            console.log(e);
        }

        d.querySelector('i').style.backgroundImage = `url('')`;
        d.querySelector('button').addEventListener('click', () => {
            f = !f;
            q('.pz-game-title-bar').style.display = c('none');
            q('#portal-editorial-content').style.display = c('none');
            q('footer').style.display = c('none');
            q('.messaging-hasbro-no-extra').style.height = c('calc(100vh - 65px)');
            
            e = q('.pz-content');
            s = e.style;
            s.height = c('100%');
            s.display = c('flex');
            s.justifyContent = s.alignItems = c('center');
            
            r = e.clientHeight;
            
            e = q('#crossword-container');
            s = e.style;
            s.marginTop = c('0');
            
            r = r/e.clientHeight;
            
            s.transform = c(`scale(${r})`);
            s.width = c(`calc(100vw / ${r})`);
        });
        e.parentNode.insertBefore(d, e.nextSibling);
    }).observe(document.querySelector('.pz-game-field'), { childList: true });
})();