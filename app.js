// =========================================================================
// ENGINE ENGINE CLOUD CORE ENGINE - WEDDING MANAGEMENT SYSTEM (FIREBASE v10)
// =========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// 1. CHUỖI CẤU HÌNH LIÊN KẾT FIREBASE (Thay thế bằng các thông số trên Console của bạn)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Khởi chạy nền tảng Cloud
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Định vị các bảng chứa dữ liệu trên Firestore
const rsvpCollection = collection(db, "wedding_rsvps");
const wishesCollection = collection(db, "wedding_wishes");


// =========================================================================
// PHẦN KHỞI CHẠY LOGIC CHO TRANG QUẢN TRỊ (ADMIN.HTML)
// =========================================================================
const adminRsvpRows = document.getElementById('admin-rsvp-rows');
const adminWishesGrid = document.getElementById('admin-wishes-grid');

if (adminRsvpRows) {
    // Truy vấn sắp xếp RSVP gửi muộn nhất lên đầu danh sách
    const rsvpQuery = query(rsvpCollection, orderBy("createdAt", "desc"));
    
    onSnapshot(rsvpQuery, (snapshot) => {
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
    });

    // Sự kiện lắng nghe lệnh xóa RSVP trực tiếp từ phía Admin
    adminRsvpRows.addEventListener('click', async (e) => {
        const targetBtn = e.target.closest('.btn-delete-rsvp');
        if (!targetBtn) return;
        const id = targetBtn.getAttribute('data-id');
        if (confirm("Bạn có chắc chắn muốn xóa phản hồi RSVP này của khách mời? Hành động này không thể hoàn tác.")) {
            await deleteDoc(doc(db, "wedding_rsvps", id));
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
    const wishesQuery = query(wishesCollection, orderBy("createdAt", "desc"));
    
    onSnapshot(wishesQuery, (snapshot) => {
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
    });

    // Thao tác xóa nhanh lời chúc độc hại/spam từ giao diện quản lý lưu bút
    adminWishesGrid.addEventListener('click', async (e) => {
        const targetBtn = e.target.closest('.btn-delete-wish');
        if (!targetBtn) return;
        const id = targetBtn.getAttribute('data-id');
        if (confirm("Xóa bỏ lời chúc này khỏi bức tường công khai?")) {
            await deleteDoc(doc(db, "wedding_wishes", id));
        }
    });
}