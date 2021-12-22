/* Create By Pioupia https://github.com/pioupia/markdown-to-html/ | MIT License */
class markdownConvertor {
    constructor(options) {
        this.specials = [
            {
                string: "**",
                aliases: [],
                classes: [],
                htmlCode: "strong",
                id: "",
                priority: 1
            },
            {
                string: "__",
                aliases: [],
                classes: ["underline"],
                htmlCode: "span",
                id: "",
                priority: 1
            },
            {
                string: "_",
                aliases: ["*"],
                classes: [],
                htmlCode: "em",
                id: "",
                priority: .75
            },
            {
                string: "```",
                classes: ["code"],
                htmlCode: "code",
                id: "",
                priority: 1
            },
            {
                string: "~~",
                classes: [],
                htmlCode: "s",
                id: "",
                priority: 1
            },
            {
                string: "> ",
                classes: [],
                htmlCode: "blockquote",
                id: "",
                priority: 1
            },
            {
                string: "||",
                classes: ["textHidden"],
                htmlCode: "span",
                id: "",
                events: {
                        onclick: 'event.target.classList.contains(\'active\')?event.target.classList.remove(\'active\'):event.target.classList.add(\'active\')"'
                    },
                priority: 1
            }
        ]
        this.mode = options?.mode || 'view';
    }

    init(){
    	this.comileReplace();
    }
    
    comileReplace(){
    	this.specials = this.specials.sort((a,b) => b.priority - a.priority);
        this.specials.forEach(e => {
            e.string = e.string.split('').map(r => '\\'+r).join('');
            if((e?.aliases?.length??0) > 0){
                e.aliases.forEach(a => a = a.split('').map(r => '\\'+r).join(''));
            }
        });
    }

    render(html){
        html = this.replaceAllCharacters(html);
        html = this.getColors(html);
        html = this.replaceLigne(html);
        html = this.detectLink(html);
        html = this.getTitles(html);
        html = this.getImages(html);
        return html;
    }
    
    addStyle(caracters, replaceBy){
        if(!caracters.isArray || typeof replaceBy !== 'string') return console.log("Please provide an Array for the caracters to replace and a string for the value you want to replace by.");
        this.specials.push([...caracters, repaceBy]);
        this.comileReplace();
        return this;
    }

    replaceAllCharacters(html){
        let res = html;
        this.specials.forEach(e => {
            const txt = new RegExp(`(?<=${e.string}\s*).*?(?=\s*${e.string})`, 'g');
            const regexr = new RegExp(`(${e.string}s*).*?(\s*${e.string})`, 'g');
            res = res.replace(regexr, (str) => {
                const size = e.string.length / 2;
                return `<${e.htmlCode}${e.id ? ` id="${e.id}"` : ""}${e.classes ? ` class="${e.classes.join(' ')}"` : ""} ${e.events ? Object.keys(e.events).map(r => `${r}="${e.events[r]}"`).join(' ') : ""}>${str.slice(size, str.length-size)}</${e.htmlCode}>`;
            });
        });
        return res;
    }

    getColors(html){
        let split = html.split('{ ');
        for(let i = 1; i < split.length; i++) {
            const split2 = split[i].split('}')[0];
            split[i] = `<span${split2.includes('color') ? ' style="color:'+split2.split(':')[1].split(';')[0].trim()+'"' :''}>${split2.split(';').slice(1).join(';')}</span>` + split[i].split('}').slice(1)?.join('}')
        }

        return split.join('');
    }

    getImages(html){
        let split = html.split('![');
        let next = '';
        for(let i = 1; i < split.length; i++) {
            let alt = split[i].split('](');
            let img = `<img alt="${alt[0]}" title="${alt[0]}"`;
            alt = alt[1].split(')');
            img += ` src="${alt[0]}"`;
            if(alt[1].indexOf('{') === 0){
                alt = alt[1].split('{')[1].split("}")[0]?.split(';');
                img += ` width='${alt[0]}' height=${alt[1]}`;
                next = split[i].split(/[^\]]*]\([^)]*\)\{[^}]*\}/)[1];
            }else next = split[i].split(/[^\]]*]\([^)]*\)/)[1];
            split[i] = `${img}> ${next}`;
        }
        return split.join('');
    }

    replaceLigne(html) {
        return html.replace(/(?:\r\n|\r|\n)/g, '<br>');
    }

    detectLink(html){
        return html.replace(/(https?:\/\/[^\s]+)/g, (url) => {
            if(url.includes('"')) return url;
            const isBr = url.match(/<\/?(?:article|aside|bdi|command|details|dialog|summary|figure|figcaption|footer|header|hgroup|mark|meter|nav|progress|ruby|rt|rp|section|time|wbr|audio|video|source|embed|track|canvas|datalist|keygen|output|!--|!DOCTYPE|a|abbr|address|area|b|base|bdo|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|dd|del|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|hr|html|i|iframe|img|input|ins|kdb|keygen|label|legend|li|link|map|menu|meta|noscript|object|ol|optgroup|option|p|param|pre|q|s|samp|script|select|small|source|span|strong|style|sub|sup|table|tbody|td|textarea|tfoot|th|thead|title|tr|u|ul|var|acronym|applet|basefont|big|center|dir|font|frame|frameset|noframes|strike|tt)(?:(?: [^<>]*)>|>?)+>/);
            return `<a href="${(isBr&&(isBr?.length??0)>0)?url.slice(0, url.indexOf(isBr[0])):url}" target="_blank" rel="noreferrer" class="link">${(isBr&&(isBr?.length??0)>0)?url.slice(0, url.indexOf(isBr[0])):url}</a>${(isBr&&(isBr?.length??0)>0)?url.slice(url.indexOf(isBr[0])):''}`;
        });
    }

    getTitles(html){
        let str = '#';
        for(let i = 5; i > 0; i--){
            const split = html.split(str.repeat(i));
            for(let o = 1; o < split.length; o++) {
                const split2 = split[o].split('<br>');
                if(split2[0]?.replace(/ /g,'')?.length < 1) continue;
                split[o] = `<h${i} class="title-${i}">${split2[0]}</h${i}>\n${split2.slice(1)?.join('<br>')||''}`;
            }
            html = split.join('');
        }
        return html;
    }
    
    setMode(mode){
        if(!['edit','view'].includes(mode)) return 'The chosen mode does not exist';
        this.mode = mode;return true;
    }
}
