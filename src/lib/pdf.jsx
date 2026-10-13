import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Certificate from '../components/Certificate.jsx'

// Renders the certificate off-screen, captures it and saves an A4 PDF.
export async function downloadCertificatePdf(cert) {
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:-10000px;top:0;'
  document.body.appendChild(host)
  const root = createRoot(host)
  try {
    flushSync(() => root.render(<Certificate cert={cert} />))
    const imgs = [...host.querySelectorAll('img')]
    await Promise.all(
      imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r })))
    )
    const canvas = await html2canvas(host.firstChild, { scale: 2, backgroundColor: '#ffffff' })
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297)
    pdf.save(`Certificate-${cert.cert_no || cert.id}.pdf`.replace(/[\/\\]/g, '-'))
  } finally {
    root.unmount()
    host.remove()
  }
}
