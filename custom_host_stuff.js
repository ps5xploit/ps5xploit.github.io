
async function runJailbreak() {
    window.jb_in_progress = true;
    window.jb_started = true;

    let postjb = document.getElementById("post-jb-view");
    postjb.style.opacity = "0";
    postjb.style.pointerEvents = "none";

    document.getElementById("run-jb-parent").style.opacity = "0";
    await sleep(100);
    document.getElementById("run-jb-parent").style.display = "none";
    document.getElementById("jb-progress").style.opacity = "1";
    await sleep(100);

    create_payload_buttons();
    setTimeout(async () => {
        await run_psfree();
    }, 100);
}

function onload_setup() {
    if (document.documentElement.hasAttribute("manifest")) {
        add_cache_event_toasts();
    }

    document.documentElement.style.overflowX = 'hidden';
    let center_view = document.getElementById("center-view");

    let menu_overlay = document.getElementById("menu-overlay");
    let menu = document.getElementById("menu-bar-wrapper");

    // Siempre establece "psfree" como el tipo de exploit
    localStorage.setItem("wk_exploit_type", "psfree");
    document.getElementById("wk-exploit-psfree").checked = true;

    let isTransitionInProgress = false;

    center_view.style.transition = "left 0.4s ease, opacity 0.25s ease";
    center_view.style.pointerEvents = "auto";
    center_view.style.opacity = "1";

    window.addEventListener('keydown', function (event) {
        if (event.keyCode == 52 || event.keyCode == 119) {
            if (isTransitionInProgress || window.jb_in_progress || window.jb_started) {
                return;
            }
            isTransitionInProgress = true;
            if (menu_overlay.style.top == "-100%") {
                menu_overlay.style.top = "0";
                menu_overlay.style.opacity = "1";
                menu.style.right = "0";
                setTimeout(() => {
                    isTransitionInProgress = false;
                }, 420);
            } else {
                menu_overlay.style.opacity = "0";
                menu.style.right = "-400px";
                setTimeout(() => {
                    menu_overlay.style.top = "-100%";
                    isTransitionInProgress = false;
                }, 420);
            }
        }
    });
}

// Función para actualizar el contenido del div info
async function log(message) {
    console.log(message);
    const infoBox = document.getElementById('info');
    if (infoBox) {
        infoBox.textContent = message;
    }
}

// Modificar la función create_payload_buttons para agregar eventos
function create_payload_buttons() {
    window.local_payload_queue = [];
    for (let i = 0; i < payload_map.length; i++) {
        let btn = document.createElement("a");
        btn.id = "payload-" + i;
        btn.className = "btn mx-auto";
        btn.tabIndex = "0";
        btn.setAttribute('data-info', payload_map[i].info);
        btn.onclick = async () => {
            if (false) { showToast(payload_map[i].displayTitle + " added to queue.", 1000); }
            window.local_payload_queue.push(payload_map[i]);
        };

        let btn_child = document.createElement("p");
        btn_child.className = "payload-name";
        btn_child.innerHTML = payload_map[i].displayTitle;
        btn.appendChild(btn_child);

        let btn_child2 = document.createElement("p");
        btn_child2.className = "payload-description";
        btn_child2.innerHTML = payload_map[i].description;
        btn.appendChild(btn_child2);

        let btn_child3 = document.createElement("p");
        btn_child3.className = "payload-author";
        btn_child3.innerHTML = "v" + payload_map[i].version + " &centerdot; " + payload_map[i].author;
        btn.appendChild(btn_child3);

        document.getElementById("payloads-list").appendChild(btn);

        btn.addEventListener('mouseenter', async function() {
            await log(this.getAttribute('data-info'));
        });
        btn.addEventListener('mouseleave', async function() {
            await log('');
        });

        setTimeout(() => {
            btn.classList.add("show");
        }, 100);
    }
}

async function switch_to_post_jb_view() {
    document.getElementById("run-jb-parent").style.display = "none";

    document.getElementById("jb-progress").style.opacity = "0";
    await sleep(1000);
    document.getElementById("jb-progress").style.display = "none";

    document.getElementById("post-jb-view").style.opacity = "0";
    document.getElementById("post-jb-view").classList.add("opacity-transition");
    document.getElementById("post-jb-view").style.display = "flex";
    document.getElementById("post-jb-view").style.opacity = "1";

    document.getElementById("credits").style.opacity = "0";
    document.getElementById("credits").style.display = "none";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showToast(message, timeout = 2000) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    toastContainer.appendChild(toast);

    toast.offsetHeight;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, timeout);
}
