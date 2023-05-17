javascript: (() => {
    const hideUserIcon = false;
    const disableModeration = true;
    const scale = 1.0;
    const width = 840;
    if (!window.html2canvas) {
        const scriptNode = document.createElement('script');
        scriptNode.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.head.appendChild(scriptNode);
        scriptNode.addEventListener('load', () => {
            document.body.insertAdjacentHTML('afterbegin', `<button class='capture-btn' style='position:fixed;right:50px;top:8px;z-index:9999;'>📷</button>`);
            document.querySelector('.capture-btn').addEventListener('click', capture);
            if (!disableModeration) return;
            window.fetch = new Proxy(window.fetch, {
                apply(target, that, args) {
                    if (args[0]?.match(/\/moderations$/)) {
                        return new Response('{}');
                    }
                    else if (args[0]?.match(/\/conversation$/)) {
                        let body = JSON.parse(args[1].body);
                        body.supports_modapi = false;
                        args[1].body = JSON.stringify(body);
                    }
                    return Reflect.apply(target, that, args);
                }
            });
        }, { once: true });
    }
    async function capture() {
        const selector = 'main > .flex-1 > .h-full .flex';
        document.querySelector(selector).scrollIntoView();
        const main = document.querySelector(selector);
        const sidebarWidth = (document.querySelector('.scrollbar-trigger')?.clientWidth ?? 0) + 8;
        const title = document.title.replace(/[\\/:*?"<>|]/g, '_');
        const ignoreClasses = [
            'w-full h-32 md:h-48 flex-shrink-0',
            'text-xs flex items-center',
        ];
        const config = {
            scale: scale,
            windowWidth: 1600,
            windowHeight: 900,
            width,
            x: (1600 - sidebarWidth) / 2 - width / 2,
            onclone: async (d) => {
                const userIcons = d.querySelectorAll('img.rounded-sm');
                if (!userIcons) return;
                let base64String = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mNkYGAAAAAIAAIFFRIrAAAAAElFTkSuQmCC';
                if (!hideUserIcon) {
                    const iconUrl = [...userIcons].find(el => el.src.startsWith('http'))?.src;
                    const arrayBuffer = await (await fetch(iconUrl)).arrayBuffer();
                    base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                }
                for (const el of userIcons) {
                    el.srcset = `data:image/webp;base64,${base64String}`;
                    el.src = `data:image/webp;base64,${base64String}`;
                }
            },
            ignoreElements: el => ignoreClasses.some(c => String(el.className).includes(c))
        };
        const canvas = await html2canvas(main, config);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png', 1.0);
        link.download = title;
        link.click();
    }
})();
