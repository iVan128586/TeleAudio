






function dump_settings(voice_value, demo_value){
    if(voice_value !== null){
        localStorage.setItem("teleau_settings_voice", JSON.stringify({value: voice_value}))
    }
    if(demo_value !== null){
        localStorage.setItem("teleau_settings_demo", JSON.stringify({value: demo_value}))
    }
}

function load_settings(){
    let voice_value = 0.5;
    let demo_value = 0.5;

    if(localStorage.getItem("teleau_settings_voice") !== null && JSON.parse(localStorage.getItem("teleau_settings_voice")).value != undefined){
        voice_value = JSON.parse(localStorage.getItem("teleau_settings_voice")).value;

    }
    if(localStorage.getItem("teleau_settings_demo") !== null && JSON.parse(localStorage.getItem("teleau_settings_demo")).value != undefined){
        demo_value = JSON.parse(localStorage.getItem("teleau_settings_demo")).value;
    }

    return {voice: voice_value, demo: demo_value}
}

function format_percent(value){
    return `${(value * 100).toFixed(2)}%`
}

function create_font_style(){
    const ASSETS_DIR = chrome.runtime.getURL('assets');
    
    let style = document.createElement("style");
    style.textContent = `
        @font-face{
            font-family: "iosevka";
            src: url("${ASSETS_DIR}/fonts/Iosevka/IosevkaCharonMono-Bold.ttf") format("truetype");
            font-weight: bold;
            font-style: normal;
        }
        @font-face{
            font-family: "iosevka";
            src: url("${ASSETS_DIR}/fonts/Iosevka/IosevkaCharonMono-BoldItalic.ttf") format("truetype");
            font-weight: bold;
            font-style: italic;
        }
        @font-face{
            font-family: "iosevka";
            src: url("${ASSETS_DIR}/fonts/Iosevka/IosevkaCharonMono-Italic.ttf") format("truetype");
            font-weight: normal;
            font-style: italic;
        }
        @font-face{
            font-family: "iosevka";
            src: url("${ASSETS_DIR}/fonts/Iosevka/IosevkaCharonMono-Light.ttf") format("truetype");
            font-weight: light;
            font-style: normal;
        }
        @font-face{
            font-family: "iosevka";
            src: url("${ASSETS_DIR}/fonts/Iosevka/IosevkaCharonMono-LightItalic.ttf") format("truetype");
            font-weight: light;
            font-style: italic;
        }
        @font-face{
            font-family: "iosevka";
            src: url("${ASSETS_DIR}/fonts/Iosevka/IosevkaCharonMono-Medium.ttf") format("truetype");
            font-weight: medium;
            font-style: normal;
        }
        @font-face{
            font-family: "iosevka";
            src: url("${ASSETS_DIR}/fonts/Iosevka/IosevkaCharonMono-MediumItalic.ttf") format("truetype");
            font-weight: medium;
            font-style: italic;
        }
        @font-face{
            font-family: "iosevka";
            src: url("${ASSETS_DIR}/fonts/Iosevka/IosevkaCharonMono-Regular.ttf") format("truetype");
            font-weight: normal;
            font-style: normal;
        }
    `;
    
    document.head.appendChild(style);
}

function create_content_node(){
    let content = document.createElement('div')
    content.classList.add('teleau-content')
    content.classList.add('loading')
    content.innerHTML = `
        <div>Настройки голоса</div>
        <div class="voice">
            <div>Голос: <span class="output">100%</span></div>
            <div class="bar">
                <div class="display"></div>
                <input type="range" min="0" max="1" value="1" step="0.0000001">
            </div>
        </div>
        <div class="demo">
            <div>Демка: <span class="output">100%</span></div>
            <div class="bar">
                <div class="display"></div>
                <input type="range" min="0" max="1" value="1" step="0.0000001">
            </div>
        </div>
    `
    return content
}

async function get_sound_nodes(){
    return new Promise(resolve => {
        let int = setInterval(() => {
            let sound_nodes = [...document.querySelectorAll("audio.goloom_mid_audio")];
            if(sound_nodes.length >= 2){
                clearInterval(int);
                resolve(sound_nodes);
            }
        }, 1000);
    });
}

async function load(content, voice, demo){
    let line_voice = voice.querySelector('input')
    let line_demo = demo.querySelector('input')
    let output_voice = voice.querySelector('.output')
    let output_demo = demo.querySelector('.output')

    let sound_nodes = await get_sound_nodes()
    let voice_sound_node = sound_nodes[1]
    let demo_sound_node = sound_nodes[0]

    settings = load_settings()
    console.log(settings)
    voice_sound_node.volume = settings.voice
    demo_sound_node.volume = settings.demo
    line_voice.value = settings.voice
    line_demo.value = settings.demo
    voice.style.setProperty("--len", `${settings.voice}`)
    demo.style.setProperty("--len", `${settings.demo}`)
    output_voice.innerText = format_percent(settings.voice)
    output_demo.innerText = format_percent(settings.demo)
    
    line_voice.addEventListener('input', () => {
        let value = line_voice.value

        voice.style.setProperty("--len", `${value}`)
        voice_sound_node.volume = value
        output_voice.innerText = format_percent(value)
        dump_settings(voice_value = value, demo_value = null)
    })
    
    line_demo.addEventListener('input', () => {
        let value = line_demo.value

        demo.style.setProperty("--len", `${value}`)
        demo_sound_node.volume = value
        output_demo.innerText = format_percent(value)
        dump_settings(voice_value = null, demo_value = value)
    })

    content.classList.remove('loading')
}







if(location.href.startsWith("https://telemost.yandex.ru/private-join")){
    create_font_style()

    let content = create_content_node()
    document.querySelector('body').appendChild(content)
    
    let voice = content.querySelector('.voice')
    let demo = content.querySelector('.demo')
    
    load(content, voice, demo)
}






