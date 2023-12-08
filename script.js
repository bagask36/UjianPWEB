const buku = [];
const RENDER_EVENT = "render-buku";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addBuku();
  });
});

function addBuku() {
  const nama = document.getElementById("nama").value;
  const email = document.getElementById("email").value;
  const noTelp = document.getElementById("nomor").value;
  const tglReservasi = document.getElementById("tgl-reservasi").value;

  if (noTelp.length == 11 || noTelp.length == 12) {
    window.location.reload();
    const generatedID = generateId();
    const bukuObjek = generateBukuObjek(
      generatedID,
      nama,
      email,
      noTelp,
      tglReservasi,
      false
    );
    buku.push(bukuObjek);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  } else {
    alert(
      "Tahun Penerbit Tidak Boleh " +
        noTelp.length +
        " Digit Harus 11 atau 12 Digit"
    );
  }
}

function generateId() {
  return +new Date();
}
function generateBukuObjek(id, nama, email, noTelp, tglReservasi, isCompleted) {
  return {
    id,
    nama,
    email,
    noTelp,
    tglReservasi,
    isCompleted,
  };
}

function buatBuku(bukuObjek) {
  const buatNama = document.createElement("h2");
  buatNama.innerText = bukuObjek.nama;

  const buatEmail = document.createElement("p");
  buatEmail.innerHTML = "Email: " + bukuObjek.email;

  const buatNoTelp = document.createElement("p");
  buatNoTelp.innerHTML = "Nomor Telepon: " + bukuObjek.noTelp;
  const tglReservasi = document.createElement("p");
  tglReservasi.innerHTML = "Tanggal Reservasi: " + bukuObjek.tglReservasi;

  const textContainer = document.createElement("div");
  textContainer.classList.add("Inner");
  textContainer.append(buatNama, buatEmail, buatNoTelp, tglReservasi);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `buku-${bukuObjek.id}`);

  if (bukuObjek.clear) {
    bukuObjek.isCompleted = true;
  }

  if (bukuObjek.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.innerText = "Undo";

    undoButton.addEventListener("click", function () {
      bukuObjek.clear = false;
      undoReadFromCompleted(bukuObjek.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.innerText = "Hapus";

    trashButton.addEventListener("click", function () {
      const yakin = confirm(
        "Apakah anda yakin ingin menghapus data dari " + bukuObjek.nama
      );
      if (yakin) {
        removeReadFromCompleted(bukuObjek.id);
      }
    });

    const buttonGrup = document.createElement("div");
    buttonGrup.classList.add("button-grup");

    buttonGrup.append(undoButton, trashButton);
    container.append(buttonGrup);
  } else {
    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.innerText = "Edit";

    editButton.addEventListener("click", function () {
      editReadFromCompleted(
        bukuObjek.id,
        bukuObjek.nama,
        bukuObjek.email,
        bukuObjek.noTelp,
        bukuObjek.tglReservasi
      );
    });

    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.innerText = "Selesai";

    checkButton.addEventListener("click", function () {
      addReadToCompleted(bukuObjek.id);
    });

    const buttonGrup = document.createElement("div");
    buttonGrup.classList.add("button-grup");

    buttonGrup.append(checkButton, editButton);
    container.append(buttonGrup);
  }

  return container;
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedReadBook = document.getElementById("belum-dibaca");
  uncompletedReadBook.innerHTML = "";

  const completedReadBook = document.getElementById("sudah-dibaca");
  completedReadBook.innerHTML = "";
  for (const bookItem of buku) {
    const bookElement = buatBuku(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedReadBook.append(bookElement);
    } else {
      completedReadBook.append(bookElement);
    }
  }
});

function addReadToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of buku) {
    if (bookItem.id == bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeReadFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget == -1) return;

  buku.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoReadFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editReadFromCompleted(bookId, nama, email, noTelp, tglReservasi) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  document.getElementById("nama").value = nama;
  document.getElementById("email").value = email;
  document.getElementById("nomor").value = noTelp;
  document.getElementById("tgl-reservasi").value = tglReservasi;

  buku.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in buku) {
    if (buku[index].id == bookId) {
      return index;
    }
  }

  return -1;
}

// simpan di local storage
const SAVED_EVENT = "saved-buku";
const STORAGE_KEY = "RESTO_GRILL";

function isStorageExist() {
  if (typeof Storage == undefined) {
    alert("Browsermu tidak ada local storage");
    return false;
  }

  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(buku);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// tambah load data
function loadDataFromStorage() {
  const seriallizedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(seriallizedData);

  if (data !== null) {
    for (const book of data) {
      buku.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
