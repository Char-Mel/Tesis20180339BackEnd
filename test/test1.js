const EncryptionModule = require('../controllers/utils/encryption')
const certificates = require('./certificates.test.json')
const encryptedCertificates = []

for (const certificate of certificates) {
  const { idStudent } = certificate
  const encryptedCertificate = EncryptionModule.encryptCertificate(certificate)
  console.debug('Certificate encrypted', encryptedCertificate)
  console.debug('')
  encryptedCertificates.push({ encryptedCertificate, idStudent })
}
