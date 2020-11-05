# SMARAK API

Smart Contract Musyarakah API.

## Tools

1. [Nodejs] >= v12.14.1
2. [Yarn] 
3. [MongoDB] sebagai database
4. [APIDOC] untuk membuat dokumentasi

## Configuration

Copy file `.env.example` menjadi `.env` dan sesuikan isi variabelnya.

## Run server

Untuk menjalankan server, gunakan perintah `yarn start` atau `yarn dev` untuk menjalankan server versi development.

## Konfigurasi Email

Sesuaikan isi dari valiabel berikut yang ada di dalam file `.env` dengan konfigurasi SMTP yang Anda miliki:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### Deprecated

~~Karena masih menggunakan service dari [Gmail] aktifkan fitur **Akses aplikasi yang kurang aman** ([allowaccess]) dari **off** menjadi **on**.~~

## Generate API Docs

Untuk men-generasi API Docs, gunakan perintah `yarn docs`.

[Nodejs]: https://nodejs.org/en/download/
[Yarn]: https://classic.yarnpkg.com/en/docs/install/
[MongoDB]: https://docs.mongodb.com/manual/administration/install-community/
[APIDOC]: https://apidocjs.com/
[Gmail]: https://mail.google.com/
[Allowaccess]: https://myaccount.google.com/lesssecureapps
