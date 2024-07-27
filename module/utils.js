/* Copyright (C) 2023 anonymous

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

function die(msg) {
    const event = new KeyboardEvent('keydown', { keyCode: 27, which: 27 });
    document.dispatchEvent(event);
    throw new Error("⚠️​ PSFree fail! " + msg + "\n​★ Click accept to 🔄");
}

function manejarKeyPress(event) {
    if (event.keyCode === 27) {
        location.reload();
    }
}

document.addEventListener("keydown", manejarKeyPress);

function debug_log(msg) {
    print(msg);
}

function clear_log() {
}

function str2array(str, length, offset) {
    if (offset === undefined) {
        offset = 0;
    }
    let a = new Array(length);
    for (let i = 0; i < length; i++) {
        a[i] = str.charCodeAt(i + offset);
    }
    return a;
}

function align(a, alignment) {
    if (!(a instanceof Int)) {
        a = new Int(a);
    }
    const mask = -alignment & 0xffffffff;
    let type = a.constructor;
    let low = a.low() & mask;
    return new type(low, a.high());
}

async function send(url, buffer, file_name, onload=() => {}) {
    const file = new File(
        [buffer],
        file_name,
        {type:'application/octet-stream'}
    );
    const form = new FormData();
    form.append('upload', file);

    debug_log('send');
    const response = await fetch(url, {method: 'POST', body: form});

    if (!response.ok) {
        throw Error(`Network response was not OK, status: ${response.status}`);
    }
    onload();
}
