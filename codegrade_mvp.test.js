const request = require('supertest')
const server = require('./api/server')
const User = require('./api/users/model')

test('[0] sanity check', () => {
  expect(true).not.toBe(false)
})

const initialUsers = [
  { name: 'Ed Carter', bio: 'hero' },
  { name: 'Mary Edwards', bio: 'super hero' },
]

beforeEach(() => {
  User.resetDB()
})

describe('server.js', () => {
  // 👉 USERS
  // 👉 USERS
  // 👉 USERS
  describe('kullanıcı uçnoktası', () => {
    describe('[POST] /api/users', () => {
      test('[1] yeni kullanıcıyla cevap veriyor', async () => {
        const newUser = { name: 'foo', bio: 'bar' }
        const res = await request(server).post('/api/users').send(newUser)
        expect(res.body).toHaveProperty('id')
        expect(res.body).toMatchObject(newUser)
      }, 750)
      test('[2] veritabanına yeni kullanıcı ekliyor', async () => {
        const newUser = { name: 'fizz', bio: 'buzz' }
        await request(server).post('/api/users').send(newUser)
        const users = await User.find()
        expect(users[0]).toMatchObject(initialUsers[0])
        expect(users[1]).toMatchObject(initialUsers[1])
        expect(users[2]).toMatchObject(newUser)
      }, 750)
      test('[3] doğru HTTP durum kodu dönüyor', async () => {
        const newUser = { name: 'fizz', bio: 'buzz' }
        const res = await request(server).post('/api/users').send(newUser)
        expect(res.status).toBe(201)
      }, 750)
      test('[4] doğr durum kodu ve doğrulama mesajını içeriyor', async () => {
        let newUser = { name: 'only name' }
        let res = await request(server).post('/api/users').send(newUser)
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/bir name ve bio sa/)
        newUser = { bio: 'only bio' }
        res = await request(server).post('/api/users').send(newUser)
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/bir name ve bio sa/)
        newUser = {}
        res = await request(server).post('/api/users').send(newUser)
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/bir name ve bio sa/)
      }, 750)
    })
    describe('[GET] /api/users', () => {
      test('[5] tüm kullanıcıları alabiliyor', async () => {
        const res = await request(server).get('/api/users')
        expect(res.body).toHaveLength(initialUsers.length)
      }, 750)

      test('[6] doğru kullanıcıları alabiliyor', async () => {
        const res = await request(server).get('/api/users')
        expect(res.body[0]).toMatchObject(initialUsers[0])
        expect(res.body[1]).toMatchObject(initialUsers[1])
      }, 750)
    })
    describe('[GET] /api/users/:id', () => {
      test('[7] doğru kullanıcıyla cevap veriyor', async () => {
        let [{ id }] = await User.find()
        let res = await request(server).get(`/api/users/${id}`)
        expect(res.body).toMatchObject(initialUsers[0]);

        [_, { id }] = await User.find() // eslint-disable-line
        res = await request(server).get(`/api/users/${id}`)
        expect(res.body).toMatchObject(initialUsers[1])
      }, 750)
      test('[8] yanlış idde doğru hata mesajı ve durum kodu dönüyor', async () => {
        let res = await request(server).get('/api/users/foobar')
        expect(res.status).toBe(404)
        expect(res.body.message).toMatch(/bulunamadı/)
      }, 750)
    })
    describe('[DELETE] /api/users/:id', () => {
      test('[9] silinen kullanıcıyı döndürüyor', async () => {
        let [{ id }] = await User.find()
        const choppingBlock = await User.findById(id)
        const res = await request(server).delete(`/api/users/${id}`)
        expect(res.body).toMatchObject(choppingBlock)
      }, 750)
      test('[10] deletes the user from the db', async () => {
        let [{ id }] = await User.find()
        await request(server).delete(`/api/users/${id}`)
        const gone = await User.findById(id)
        expect(gone).toBeFalsy()
        const survivors = await User.find()
        expect(survivors).toHaveLength(initialUsers.length - 1)
      }, 750)
      test('[11] doğru mesaj ve durum koduyla yanıtlanıyor', async () => {
        const res = await request(server).delete('/api/users/foobar')
        expect(res.status).toBe(404)
        expect(res.body.message).toMatch(/bulunamadı/)
      }, 750)
    })
    describe('[PUT] /api/users/:id', () => {
      test('[12] güncellenen kullanıcı dönüyor', async () => {
        let [{ id }] = await User.find()
        const updates = { name: 'xxx', bio: 'yyy' }
        const res = await request(server).put(`/api/users/${id}`).send(updates)
        expect(res.body).toMatchObject({ id, ...updates })
      }, 750)
      test('[13] güncellenen kullanıcı vt ye kaydediliyor', async () => {
        let [_, { id }] = await User.find() // eslint-disable-line
        const updates = { name: 'aaa', bio: 'bbb' }
        await request(server).put(`/api/users/${id}`).send(updates)
        let user = await User.findById(id)
        expect(user).toMatchObject({ id, ...updates })
      }, 750)
      test('[14] yanlış id de doğru durum kodu ve hata mesajı', async () => {
        const updates = { name: 'xxx', bio: 'yyy' }
        const res = await request(server).put('/api/users/foobar').send(updates)
        expect(res.status).toBe(404)
        expect(res.body.message).toMatch(/bulunamadı/)
      }, 750)
      test('[15] doğru durum kodu ve doğrulama hatası mesajı', async () => {
        let [user] = await User.find()
        let updates = { name: 'xxx' }
        let res = await request(server).put(`/api/users/${user.id}`).send(updates)
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/name ve bio/)
        updates = { bio: 'zzz' }
        res = await request(server).put(`/api/users/${user.id}`).send(updates)
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/name ve bio/)
        updates = {}
        res = await request(server).put(`/api/users/${user.id}`).send(updates)
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/name ve bio/)
      }, 750)
    })
  })
})
