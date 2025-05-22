document.addEventListener('alpine:init', () => {
    Alpine.data('products', () => ({
        items: [
            { id: 1, name: 'Robusta Brazil', img: '1.jpg', price: 20000 },
            { id: 2, name: 'Arabica Blend', img: '2.jpg', price: 25000 },
            { id: 3, name: 'Primo Passo', img: '3.jpg', price: 30000 },
            { id: 4, name: 'Aceh Gayo', img: '4.jpg', price: 35000 },
            { id: 5, name: 'Sumatra Mandheling', img: '5.jpg', price: 40000 }
        ],
    }));
    Alpine.store('cart', {
        items: [],
        total: 0,
        quantity: 0,
        add(newItem) {
            // #3 - cek apakah ada barang yang sama di cart
            const cartItem = this.items.find((item) => item.id === newItem.id)

            // jika belum ada/cart masih kosong

            if (!cartItem) {

                this.items.push({ ...newItem, quantity: 1, total: newItem.price });
                this.quantity++;
                this.total += newItem.price;
            } else {
                this.items = this.items.map((item) => {
                    // jika barang berbeda
                    if (item.id !== newItem.id) {
                        return item;
                    } else {
                        // jika barang sudah ada, tambah quantity
                        item.quantity++;
                        item.total = item.price * item.quantity;
                        this.quantity++;
                        this.total += item.price;
                        return item;
                    }
                });
            }

            // #2 - kelola item
            // this.items.push(newItem);
            // this.quantity++;
            // this.total += newItem.price;
            // console.log(this.total);

            //#1 test
            // console.log(newItem);
        },
        remove(id) {
            // ambil item yang mau di remove berdasarka id 
            const cartItem = this.items.find((item) => item.id === id);

            // jika item lebih dari 1
            if(cartItem.quantity > 1) {
                // telusuri 1 1
                this.items = this.items.map((item) => {
                    //jika bukan barang yang di klik
                    if(item.id !== id) {
                        return item;
                    } else {
                        item.quantity--;
                        item.total = item.price * item.quantity;
                        this.quantity--;
                        this.total -= item.price;
                        return item;
                    }

                });
            } else if (cartItem.quantity === 1) {
                // jika barangnya sisa 1
                this.items = this.items.filter((item) => item.id !== id);
                this.quantity--;
                this.total -= cartItem.price;
            }
        }
    });
});

// form validation
const checkoutButton = document.querySelector('.checkout-button');
checkoutButton.disabled = true;

const form = document.querySelector('#checkoutForm');

form.addEventListener('keyup', function(){
    for(let i = 0; i < form.elements.length; i++){
        if (form.elements[i].value.length !== 0){

            checkoutButton.classList.remove('disabled');
            checkoutButton.classList.add('disabled');
        } else {
            return false;
        }
    }
    checkoutButton.disabled = false;
    checkoutButton.classList.remove('disabled');
});

// kirim data ketika tombol checkout di klik
checkoutButton.addEventListener('click', async function (e){
    e.preventDefault();
    const formData = new FormData(form);
    const data = new URLSearchParams(formData);
    const objData = Object.fromEntries(data);
    // const message = formatMessage(objData);
    // window.open('http://wa.me/6285695301781?text=' + encodeURIComponent(message));

    // minta transaction token menggunakan ajax / fetch

    try {
        const response = await fetch('http://localhost:8000/php/placeOrder.php', {
            method: 'POST',
            body: data,
        });
        const token = await response.text();
        // test
    // console.log(token);
    window.snap.pay(token);
    } catch (err) {
        console.log(err.message);
    }


    // test
    // console.log(objData);
});

// format pesan whatsapp
const formatMessage = (obj)=> {
    return `Data Customer
    Nama: ${obj.name}
    Email: ${obj.email}
    No HP: ${obj.phone}
Data Pesanan
    ${JSON.parse(obj.items).map((item) => `${item.name} (${item.quantity} x ${rupiah(item.total)}) \n`)}
    TOTAL: ${rupiah(obj.total)}
    Terima Kasih.
    `;
}

//konversi ke rupiah

const rupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number);
};