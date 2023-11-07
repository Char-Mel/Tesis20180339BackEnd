const EncryptionModule = require('../controllers/utils/encryption')
const certificates = require('./certificates.test.json')
const encryptedCertificates = []

describe('Encryption Module', () => {
  describe('Encrypt certificates', () => {
    test("Should encrypt the certificates successfully", () => {
      for (let i = 0; i < certificates.length; i++) {
        const { idStudent } = certificates[i]
        const encryptedCertificate = EncryptionModule.encryptCertificate(certificates[i])
        expect(typeof (encryptedCertificate)).toBe('string')
        console.debug(`Certificate ${i + 1} encrypted:`, encryptedCertificate)
        console.debug('')
        encryptedCertificates.push({ encryptedCertificate, idStudent })
      }
    })
  })

  describe('Decrypt certificates', () => {
    test("Should decrypt the certificates successfully", () => {
      for (let i = 0; i < certificates.length; i++) {
        const { encryptedCertificate, idStudent } = encryptedCertificates[i]
        const decryptedCertificate = EncryptionModule.decryptCertificate(encryptedCertificate, idStudent)
        const { idsUniversities, type, title, diploma_date, file } = certificates[i]
        expect(decryptedCertificate).toEqual(
          expect.objectContaining({
            idsUniversities, type, title, diploma_date, file
          })
        )

        console.debug(`Certificate ${i + 1} decrypted:`, decryptedCertificate)
      }
    })
  })
})
