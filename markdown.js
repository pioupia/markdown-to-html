class markdownConvertor {
    constructor(options) {
        this.specials = [['**', 'strong'], ['__', 'span style="text-decoration: underline;"'], ['_', '*', 'em'], ['```', 'code'], ['~~', 's'], ['||', 'span class="textHidden" onclick="event.target.classList.contains(\'active\')?event.target.classList.remove(\'active\'):event.target.classList.add(\'active\')"']];
        this.mode = options?.mode || 'view';
    }

    render(html){
        html = this.searchBlockQuote(html);
        html = this.replaceAllCharacters(html);
        html = this.getColors(html);
        html = this.getImages(html);
        html = this.replaceLigne(html);
        html = this.detectLink(html);
        html = this.getTitles(html)
        return html;
    }
    
    addStyle(caracters, replaceBy){
        if(!caracters.isArray || typeof replaceBy !== 'string') return console.log("Please provide an Array for the caracters to replace and a string for the value you want to replace by.");
        this.specials.push([...caracters, repaceBy]);
        return this;
    }

    searchBlockQuote(html){
        let split = html.split(/> /);
        for(let i = 1; i < split.length; i++) {
            if((split[i-1]+'> ').match(/<\/(?:article|aside|bdi|command|details|dialog|summary|figure|figcaption|footer|header|hgroup|mark|meter|nav|progress|ruby|rt|rp|section|time|wbr|audio|video|source|embed|track|canvas|datalist|keygen|output|!--|!DOCTYPE|a|abbr|address|area|b|base|bdo|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|dd|del|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|hr|html|i|iframe|img|input|ins|kdb|keygen|label|legend|li|link|map|menu|meta|noscript|object|ol|optgroup|option|p|param|pre|q|s|samp|script|select|small|source|span|strong|style|sub|sup|table|tbody|td|textarea|tfoot|th|thead|title|tr|u|ul|var|acronym|applet|basefont|big|center|dir|font|frame|frameset|noframes|strike|tt)(?:(?: [^<>]*)>|>?)+>/)) continue;
            const split2 = split[i].split('\n')[0];
            split[i] = `<blockquote>${this.mode == 'edit' ? '> ' : ''}${split2}</blockquote>${split[i].split('\n').slice(1)?.join('\n')}`;
        }

        return split.join('');
    }

    replaceAllCharacters(html){
        let res = html;
        const specials = JSON.parse(JSON.stringify(this.specials));
        specials.forEach(e => {
            const endedHtml = e.pop();
            e.forEach(m => {
                let split = html.split(m);
                let latest = true;
                for(let i = 1; i < split.length; i++){
                    if(latest) split[i] = `<${endedHtml}>${this.mode == 'edit' ? m : ''}${split[i]}${this.mode == 'edit' ? m : ''}</${endedHtml.split(' ')[0]}>`;
                    latest = !latest;
                }
                split = split.join('');
                html = res = split;
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
            const isBr = url.match(/<\/?(?:article|aside|bdi|command|details|dialog|summary|figure|figcaption|footer|header|hgroup|mark|meter|nav|progress|ruby|rt|rp|section|time|wbr|audio|video|source|embed|track|canvas|datalist|keygen|output|'+            '!--|!DOCTYPE|a|abbr|address|area|b|base|bdo|blockquote|body|'+            'br|button|canvas|caption|cite|code|col|colgroup|dd|del|dfn|div|'+            'dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|hr|html|i|iframe|img|input|ins|kdb|keygen|label|legend|li|link|map|menu|meta|noscript|object|ol|optgroup|option|p|param|'+            'pre|q|s|samp|script|select|small|source|span|strong|style|sub|'+            'sup|table|tbody|td|textarea|tfoot|th|thead|title|tr|u|ul|var|'+            'acronym|applet|basefont|big|center|dir|font|frame|frameset|noframes|strike|tt)(?:(?: [^<>]*)>|>?)+>/);
            return `<a href="${(isBr&&(isBr?.length??0)>0)?url.slice(0, url.indexOf(isBr[0])):url}" target="_blank" class="link">${(isBr&&(isBr?.length??0)>0)?url.slice(0, url.indexOf(isBr[0])):url}</a>${(isBr&&(isBr?.length??0)>0)?url.slice(url.indexOf(isBr[0])):''}`;
        });
    }

    getTitles(html){
        let str = '#';
        for(let i = 5; i > 0; i--){
            const split = html.split(str.repeat(i));
            for(let o = 1; o < split.length; o++) {
                const split2 = split[o].split('<br>');
                split[o] = `<h${i}>${split2[0]}</h${i}>\n${split2.slice(1)?.join('<br>')||''}`;
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
