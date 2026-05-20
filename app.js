// =========================================================================
// WEDDING MANAGEMENT SYSTEM (FIREBASE COMPAT)
// =========================================================================

const firebaseConfig = {
    apiKey: "AIzaSyDjg125rB3CxikUv6pdWnvkIB6jSO52zVc",
    authDomain: "wedding-4f416.firebaseapp.com",
    projectId: "wedding-4f416",
    storageBucket: "wedding-4f416.firebasestorage.app",
    messagingSenderId: "46663095399",
    appId: "1:46663095399:web:d7e9cf248c528a7ad170c2"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
const rsvpCollection = db.collection("wedding_rsvps");
const wishesCollection = db.collection("wedding_wishes");
const siteSettingsDoc = db.collection("site_settings").doc("main");

const DEFAULT_SETTINGS = {
    couple: {
        groomFirstName: "Văn Dương",
        brideFirstName: "Thùy Dung",
        groomFullName: "Nguyễn Văn Dương",
        brideFullName: "Phạm Thùy Dung",
        groomTitle: "Kỹ Sư Phần Mềm",
        brideTitle: "Nhà Thiết Kế Đồ Họa",
        groomBio: "Một chàng trai công nghệ thực tế nhưng mang trái tim đầy mơ mộng. Luôn vững vàng gánh vác mọi điều, nhưng lại cực kỳ ngọt ngào khi ở cạnh người con gái của đời mình.",
        brideBio: "Cô gái duyên dáng sở hữu tâm hồn nghệ sĩ bay bổng. Người mang đến sắc màu rực rỡ và những tiếng cười hạnh phúc.",
        groomPhoto: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600",
        bridePhoto: "https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&q=80&w=600"
    },
    wedding: {
        dateISO: "2026-10-11T09:00:00+07:00",
        dateLabel: "11.10.2026",
        heroSubtitle: "Một hành trình mới, một lời cam kết trọn đời",
        rsvpDeadline: "15/09/2026",
        heroImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1800",
        hashtag: "#VanDuongThuyDungWedding2026"
    },
    gallery: [
        "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1510076894075-8834b4999b7a?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=1200"
    ],
    events: [
        {
            title: "Lễ Thành Hôn",
            subtitle: "Tiệc Nhà Gái & Nhà Trai",
            date: "Chủ Nhật, ngày 11 tháng 10 năm 2026",
            dateNote: "(Tức ngày 1 tháng 9 năm Bính Ngọ)",
            time: "09:00 Sáng - Đón Khách & Làm Lễ Gia Tiên",
            timeNote: "Lễ bốc nhang gia tiên và đón râu trang trọng.",
            location: "Tư Gia Nhà Gái & Nhà Trai",
            address: "An Khánh, Hoài Đức, Hà Nội",
            mapUrl: "https://maps.google.com",
            calendarTitle: "Lễ Thành Hôn Văn Dương & Thùy Dung",
            calendarStart: "20261011T090000",
            calendarEnd: "20261011T120000"
        },
        {
            title: "Tiệc Mừng Đám Cưới",
            subtitle: "Lễ Thành Hôn Chính Thức",
            date: "Chủ Nhật, ngày 11 tháng 10 năm 2026",
            dateNote: "Tổ chức dạ tiệc thân mật",
            time: "17:30 Chiều - Khai Tiệc Mừng",
            timeNote: "Đón khách: 17:30 | Lễ thành hôn: 18:30 | Nhập tiệc: 19:00",
            location: "Melia Wedding Center - Sảnh Lotus",
            address: "Số 44 Lý Thường Kiệt, Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
            mapUrl: "https://maps.google.com",
            calendarTitle: "Tiệc Mừng Đám Cưới Văn Dương & Thùy Dung",
            calendarStart: "20261011T173000",
            calendarEnd: "20261011T213000"
        }
    ],
    gifts: {
        groom: {
            bank: "Ngân hàng Techcombank (TCB)",
            number: "1903546890123",
            displayNumber: "1903 546 890 123",
            owner: "NGUYEN VAN DUONG",
            qr: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=STB%3A123456789%3AVan%20Duong%20Mung%20Cuoi"
        },
        bride: {
            bank: "Ngân hàng Vietcombank (VCB)",
            number: "101122334455",
            displayNumber: "1011 223 344 55",
            owner: "PHAM THUY DUNG",
            qr: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=STB%3A987654321%3AThuy%20Dung%20Mung%20Cuoi"
        }
    }
};
const cloneSettings = (value) => JSON.parse(JSON.stringify(value));

function mergeSettings(base, override = {}) {
    const output = cloneSettings(base);
    Object.keys(override || {}).forEach((key) => {
        if (Array.isArray(override[key])) {
            output[key] = override[key];
        } else if (override[key] && typeof override[key] === "object") {
            output[key] = mergeSettings(output[key] || {}, override[key]);
        } else if (override[key] !== undefined && override[key] !== "") {
            output[key] = override[key];
        }
    });
    return output;
}

function value(id) {
    return document.getElementById(id)?.value?.trim() || "";
}

function setValue(id, data) {
    const element = document.getElementById(id);
    if (element) element.value = data || "";
}

function toDatetimeLocal(dateISO) {
    const date = new Date(dateISO);
    if (Number.isNaN(date.getTime())) return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value) {
    return value ? `${value}:00+07:00` : DEFAULT_SETTINGS.wedding.dateISO;
}


// =========================================================================
// PHẦN KHỞI CHẠY LOGIC CHO TRANG QUẢN TRỊ (ADMIN.HTML)
// =========================================================================
const settingsForm = document.getElementById('settings-form');
const settingsStatus = document.getElementById('settings-status');
const adminRsvpRows = document.getElementById('admin-rsvp-rows');
const adminWishesGrid = document.getElementById('admin-wishes-grid');
const loginScreen = document.getElementById('login-screen');
const adminShell = document.getElementById('admin-shell');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const adminEmailLabel = document.getElementById('admin-email-label');
const logoutButton = document.getElementById('btn-logout');
let adminStarted = false;

function initAdmin() {
if (adminStarted) return;
adminStarted = true;

if (settingsForm) {
    function fillSettingsForm(settings) {
        setValue('setting-groom-first-name', settings.couple.groomFirstName);
        setValue('setting-bride-first-name', settings.couple.brideFirstName);
        setValue('setting-date-iso', toDatetimeLocal(settings.wedding.dateISO));
        setValue('setting-groom-full-name', settings.couple.groomFullName);
        setValue('setting-bride-full-name', settings.couple.brideFullName);
        setValue('setting-rsvp-deadline', settings.wedding.rsvpDeadline);
        setValue('setting-groom-title', settings.couple.groomTitle);
        setValue('setting-bride-title', settings.couple.brideTitle);
        setValue('setting-hashtag', settings.wedding.hashtag);
        setValue('setting-hero-image', settings.wedding.heroImage);
        setValue('setting-hero-subtitle', settings.wedding.heroSubtitle);
        setValue('setting-groom-photo', settings.couple.groomPhoto);
        setValue('setting-bride-photo', settings.couple.bridePhoto);
        setValue('setting-groom-bio', settings.couple.groomBio);
        setValue('setting-bride-bio', settings.couple.brideBio);
        setValue('setting-gallery', settings.gallery.join('\n'));

        settings.events.slice(0, 2).forEach((event, index) => {
            const n = index + 1;
            setValue(`setting-event-${n}-title`, event.title);
            setValue(`setting-event-${n}-subtitle`, event.subtitle);
            setValue(`setting-event-${n}-date`, event.date);
            setValue(`setting-event-${n}-time`, event.time);
            setValue(`setting-event-${n}-location`, event.location);
            setValue(`setting-event-${n}-address`, event.address);
            setValue(`setting-event-${n}-map`, event.mapUrl);
        });

        setValue('setting-groom-bank', settings.gifts.groom.bank);
        setValue('setting-groom-bank-number', settings.gifts.groom.number);
        setValue('setting-groom-bank-owner', settings.gifts.groom.owner);
        setValue('setting-groom-bank-qr', settings.gifts.groom.qr);
        setValue('setting-bride-bank', settings.gifts.bride.bank);
        setValue('setting-bride-bank-number', settings.gifts.bride.number);
        setValue('setting-bride-bank-owner', settings.gifts.bride.owner);
        setValue('setting-bride-bank-qr', settings.gifts.bride.qr);
    }

    function readSettingsForm() {
        const groomFirstName = value('setting-groom-first-name');
        const brideFirstName = value('setting-bride-first-name');
        const pairName = `${groomFirstName} & ${brideFirstName}`;
        const event1 = DEFAULT_SETTINGS.events[0];
        const event2 = DEFAULT_SETTINGS.events[1];

        return {
            couple: {
                groomFirstName,
                brideFirstName,
                groomFullName: value('setting-groom-full-name'),
                brideFullName: value('setting-bride-full-name'),
                groomTitle: value('setting-groom-title'),
                brideTitle: value('setting-bride-title'),
                groomBio: value('setting-groom-bio'),
                brideBio: value('setting-bride-bio'),
                groomPhoto: value('setting-groom-photo'),
                bridePhoto: value('setting-bride-photo')
            },
            wedding: {
                dateISO: fromDatetimeLocal(value('setting-date-iso')),
                dateLabel: new Date(fromDatetimeLocal(value('setting-date-iso'))).toLocaleDateString('vi-VN').replace(/\//g, '.'),
                heroSubtitle: value('setting-hero-subtitle'),
                rsvpDeadline: value('setting-rsvp-deadline'),
                heroImage: value('setting-hero-image'),
                hashtag: value('setting-hashtag')
            },
            gallery: value('setting-gallery').split('\n').map((url) => url.trim()).filter(Boolean),
            events: [
                {
                    ...event1,
                    title: value('setting-event-1-title'),
                    subtitle: value('setting-event-1-subtitle'),
                    date: value('setting-event-1-date'),
                    time: value('setting-event-1-time'),
                    location: value('setting-event-1-location'),
                    address: value('setting-event-1-address'),
                    mapUrl: value('setting-event-1-map'),
                    calendarTitle: `${value('setting-event-1-title')} ${pairName}`
                },
                {
                    ...event2,
                    title: value('setting-event-2-title'),
                    subtitle: value('setting-event-2-subtitle'),
                    date: value('setting-event-2-date'),
                    time: value('setting-event-2-time'),
                    location: value('setting-event-2-location'),
                    address: value('setting-event-2-address'),
                    mapUrl: value('setting-event-2-map'),
                    calendarTitle: `${value('setting-event-2-title')} ${pairName}`
                }
            ],
            gifts: {
                groom: {
                    bank: value('setting-groom-bank'),
                    number: value('setting-groom-bank-number').replace(/\s/g, ''),
                    displayNumber: value('setting-groom-bank-number'),
                    owner: value('setting-groom-bank-owner'),
                    qr: value('setting-groom-bank-qr')
                },
                bride: {
                    bank: value('setting-bride-bank'),
                    number: value('setting-bride-bank-number').replace(/\s/g, ''),
                    displayNumber: value('setting-bride-bank-number'),
                    owner: value('setting-bride-bank-owner'),
                    qr: value('setting-bride-bank-qr')
                }
            },
            updatedAt: serverTimestamp()
        };
    }

    siteSettingsDoc.get().then(async (snapshot) => {
        const settings = mergeSettings(DEFAULT_SETTINGS, snapshot.exists() ? snapshot.data() : {});
        fillSettingsForm(settings);
        if (snapshot.exists()) {
            settingsStatus.textContent = 'Đã tải cấu hình';
        } else {
            await siteSettingsDoc.set({ ...DEFAULT_SETTINGS, updatedAt: serverTimestamp() }, { merge: true });
            settingsStatus.textContent = 'Đã tạo cấu hình mẫu trên Firebase';
        }
    }).catch((error) => {
        console.error('Lỗi tải cấu hình website: ', error);
        fillSettingsForm(DEFAULT_SETTINGS);
        settingsStatus.textContent = 'Không tải được cấu hình';
    });

    document.getElementById('btn-settings-seed').addEventListener('click', async () => {
        settingsStatus.textContent = 'Đang tạo dữ liệu mẫu...';
        try {
            await siteSettingsDoc.set({ ...DEFAULT_SETTINGS, updatedAt: serverTimestamp() }, { merge: true });
            fillSettingsForm(DEFAULT_SETTINGS);
            settingsStatus.textContent = 'Đã tạo dữ liệu mẫu';
        } catch (error) {
            console.error('Lỗi tạo dữ liệu mẫu: ', error);
            settingsStatus.textContent = `Tạo dữ liệu mẫu thất bại: ${error.message}`;
        }
    });

    settingsForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        settingsStatus.textContent = 'Đang lưu...';
        try {
            await siteSettingsDoc.set(readSettingsForm(), { merge: true });
            settingsStatus.textContent = 'Đã lưu cấu hình';
        } catch (error) {
            console.error('Lỗi lưu cấu hình website: ', error);
            settingsStatus.textContent = 'Lưu thất bại';
        }
    });
}

if (adminRsvpRows) {
    // Truy vấn sắp xếp RSVP gửi muộn nhất lên đầu danh sách
    const rsvpQuery = rsvpCollection.orderBy("createdAt", "desc");
    
    rsvpQuery.onSnapshot((snapshot) => {
        adminRsvpRows.innerHTML = '';
        
        let totalGuests = 0;
        let groomSide = 0;
        let brideSide = 0;
        let declineCount = 0;

        if(snapshot.empty) {
            adminRsvpRows.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400 italic">Chưa có khách mời nào gửi phản hồi RSVP.</td></tr>`;
        }

        snapshot.forEach((snapshotDoc) => {
            const data = snapshotDoc.data();
            const docId = snapshotDoc.id;

            // Xử lý logic đếm số người và phân loại
            let currentCount = 0;
            if (data.attendance === "Có, tôi sẽ đến") {
                if (data.guests === "Chỉ mình tôi") currentCount = 1;
                else if (data.guests === "Đi cùng 1 người khác") currentCount = 2;
                else currentCount = 3; // Mặc định tính 3 người cho nhóm đi cùng gia đình

                totalGuests += currentCount;
                if (data.host === "Chú rể") groomSide += currentCount;
                if (data.host === "Cô dâu") brideSide += currentCount;
            } else {
                declineCount += 1;
            }

            // Dựng thẻ HTML dòng dữ liệu
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50/80 transition-colors";
            tr.innerHTML = `
                <td class="py-4 px-6 font-semibold text-slate-800">${data.name || '---'}</td>
                <td class="py-4 px-6 font-mono text-xs text-slate-500">${data.phone || '---'}</td>
                <td class="py-4 px-6">
                    <span class="text-xs px-2.5 py-1 rounded-full font-medium ${data.host === 'Chú rể' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}">
                        ${data.host === 'Chú rể' ? '<i class="fa-solid fa-user-tie mr-1"></i>Nhà Trai' : '<i class="fa-solid fa-user mr-1"></i>Nhà Gái'}
                    </span>
                </td>
                <td class="py-4 px-6">
                    <span class="text-xs px-2.5 py-1 rounded-full font-semibold ${data.attendance === 'Có, tôi sẽ đến' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                        ${data.attendance === 'Có, tôi sẽ đến' ? 'Tham gia' : 'Bận'}
                    </span>
                </td>
                <td class="py-4 px-6 text-center font-bold ${data.attendance === 'Có, tôi sẽ đến' ? 'text-slate-800' : 'text-slate-400'}">${currentCount}</td>
                <td class="py-4 px-6 text-xs text-slate-500 italic max-w-xs truncate" title="${data.diet || ''}">${data.diet || '<span class="text-slate-300">Không có</span>'}</td>
                <td class="py-4 px-6 text-center">
                    <button class="btn-delete-rsvp text-slate-400 hover:text-red-500 p-2 transition-colors focus:outline-none" data-id="${docId}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            adminRsvpRows.appendChild(tr);
        });

        // Đổ toàn bộ số liệu thống kê lên các thẻ Card đầu trang Admin
        document.getElementById('stat-total').innerText = totalGuests;
        document.getElementById('stat-groom-side').innerText = groomSide;
        document.getElementById('stat-bride-side').innerText = brideSide;
        document.getElementById('stat-decline').innerText = declineCount;
    }, (error) => {
        console.error('Lỗi tải RSVP: ', error);
        adminRsvpRows.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-red-500">Không tải được RSVP: ${error.message}</td></tr>`;
    });

    // Sự kiện lắng nghe lệnh xóa RSVP trực tiếp từ phía Admin
    adminRsvpRows.addEventListener('click', async (e) => {
        const targetBtn = e.target.closest('.btn-delete-rsvp');
        if (!targetBtn) return;
        const id = targetBtn.getAttribute('data-id');
        if (confirm("Bạn có chắc chắn muốn xóa phản hồi RSVP này của khách mời? Hành động này không thể hoàn tác.")) {
            await rsvpCollection.doc(id).delete();
        }
    });

    // Tính năng xuất dữ liệu ra file bảng tính đơn giản (.csv mở bằng Excel)
    document.getElementById('btn-export-excel').addEventListener('click', () => {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + "Họ và Tên,Số Điện Thoại,Gia Đình,Trạng Thái,Số Người,Ghi Chú Món Ăn\n";
        const rows = adminRsvpRows.querySelectorAll('tr');
        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            if(cols.length >= 6) {
                const name = cols[0].innerText;
                const phone = cols[1].innerText;
                const side = cols[2].innerText.trim();
                const status = cols[3].innerText.trim();
                const count = cols[4].innerText;
                const diet = cols[5].innerText.replace(/,/g, ' '); // Tránh lỗi vỡ hàng do dấu phẩy
                csvContent += `${name},${phone},${side},${status},${count},${diet}\n`;
            }
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `DANH_SACH_KHACH_RSVP_WEDDING_2026.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

if (adminWishesGrid) {
    const wishesQuery = wishesCollection.orderBy("createdAt", "desc");
    
    wishesQuery.onSnapshot((snapshot) => {
        adminWishesGrid.innerHTML = '';
        
        if (snapshot.empty) {
            adminWishesGrid.innerHTML = `<div class="col-span-full text-center py-8 text-slate-400 italic">Hiện tại chưa có lời chúc nào dán trên bức tường lưu bút.</div>`;
        }

        snapshot.forEach((snapshotDoc) => {
            const wish = snapshotDoc.data();
            const docId = snapshotDoc.id;
            const isBride = wish.relation === "Bạn Cô Dâu";

            const card = document.createElement('div');
            card.className = "bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between relative group hover:shadow-md transition-all";
            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${isBride ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">
                            ${wish.relation}
                        </span>
                        <button class="btn-delete-wish text-slate-300 hover:text-red-500 transition-colors" data-id="${docId}">
                            <i class="fa-solid fa-circle-xmark text-lg"></i>
                        </button>
                    </div>
                    <p class="text-slate-700 text-sm italic leading-relaxed">"${wish.text}"</p>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-100 text-right">
                    <span class="font-bold text-xs text-slate-800">— ${wish.name}</span>
                </div>
            `;
            adminWishesGrid.appendChild(card);
        });
    }, (error) => {
        console.error('Lỗi tải lời chúc: ', error);
        adminWishesGrid.innerHTML = `<div class="col-span-full text-center py-8 text-red-500">Không tải được lời chúc: ${error.message}</div>`;
    });

    // Thao tác xóa nhanh lời chúc độc hại/spam từ giao diện quản lý lưu bút
    adminWishesGrid.addEventListener('click', async (e) => {
        const targetBtn = e.target.closest('.btn-delete-wish');
        if (!targetBtn) return;
        const id = targetBtn.getAttribute('data-id');
        if (confirm("Xóa bỏ lời chúc này khỏi bức tường công khai?")) {
            await wishesCollection.doc(id).delete();
        }
    });
}
}

if (loginForm) {
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((error) => {
        console.error('Lỗi thiết lập phiên đăng nhập: ', error);
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = value('admin-email');
        const password = value('admin-password');
        loginError.classList.add('hidden');

        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            console.error('Lỗi đăng nhập admin: ', error);
            loginError.textContent = 'Đăng nhập thất bại. Kiểm tra email, mật khẩu hoặc trạng thái Firebase Auth.';
            loginError.classList.remove('hidden');
        }
    });

    logoutButton?.addEventListener('click', () => {
        auth.signOut().then(() => window.location.reload());
    });

    auth.onAuthStateChanged((user) => {
        if (user) {
            loginScreen.classList.add('hidden');
            adminShell.classList.remove('hidden');
            adminEmailLabel.textContent = user.email || user.uid;
            initAdmin();
        } else {
            adminShell.classList.add('hidden');
            loginScreen.classList.remove('hidden');
            adminEmailLabel.textContent = '';
        }
    });
} else {
    initAdmin();
}
