import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

/**
 * Format a date string to a human-readable format.
 */
const fmtDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

/**
 * Build the HTML string for the Vaccination Passport PDF.
 */
const buildHTML = (pet, vaccinations, ownerName) => {
    const today = fmtDate(new Date().toISOString());

    const vaccinationRows = vaccinations.map((vac, index) => `
        <tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">
            <td class="cell-num">${index + 1}</td>
            <td class="cell-name">
                <strong>${vac.vaccineName}</strong>
                ${vac.lotNumber ? `<br/><span class="lot">Lot: ${vac.lotNumber}</span>` : ''}
            </td>
            <td>${fmtDate(vac.administeredDate)}</td>
            <td>${fmtDate(vac.nextDueDate)}</td>
            <td>${vac.administeredBy || '—'}</td>
            <td>${vac.clinicName || '—'}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Inter', -apple-system, Arial, sans-serif;
                color: #1e1c10;
                background: #fff;
                padding: 0;
            }

            .page {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 36px;
            }

            /* Header Banner */
            .header {
                background: linear-gradient(135deg, #a2d2ff 0%, #6ba8e0 100%);
                border-radius: 16px;
                padding: 32px 30px;
                color: #fff;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 28px;
            }
            .header-left h1 {
                font-size: 26px;
                font-weight: 900;
                letter-spacing: -0.5px;
                margin-bottom: 4px;
            }
            .header-left .subtitle {
                font-size: 13px;
                opacity: 0.85;
                font-weight: 500;
            }
            .header-right {
                text-align: right;
                font-size: 12px;
                opacity: 0.85;
            }
            .header-right .date-label {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 700;
                opacity: 0.7;
            }

            /* Pet Info Card */
            .pet-card {
                background: #f8f5ec;
                border-radius: 14px;
                padding: 24px 28px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 28px;
                border: 1px solid #e9e2d0;
            }
            .pet-info-grid {
                display: flex;
                gap: 40px;
            }
            .info-item {
                display: flex;
                flex-direction: column;
            }
            .info-label {
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: #79573f;
                font-weight: 700;
                margin-bottom: 4px;
            }
            .info-value {
                font-size: 16px;
                font-weight: 700;
                color: #1e1c10;
            }
            .paw-icon {
                font-size: 36px;
                opacity: 0.15;
            }

            /* Table */
            .table-title {
                font-size: 16px;
                font-weight: 800;
                color: #79573f;
                margin-bottom: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .table-title .icon {
                font-size: 18px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 12px rgba(111,78,55,0.06);
            }
            thead th {
                background: #79573f;
                color: #fff;
                padding: 12px 14px;
                text-align: left;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 700;
            }
            thead th:first-child {
                width: 40px;
                text-align: center;
            }
            tbody td {
                padding: 14px;
                font-size: 13px;
                border-bottom: 1px solid #efe8d5;
                vertical-align: top;
            }
            .row-even { background: #fff; }
            .row-odd { background: #faf7f0; }
            .cell-num {
                text-align: center;
                font-weight: 700;
                color: #79573f;
            }
            .cell-name strong {
                display: block;
                color: #1e1c10;
                font-size: 14px;
            }
            .lot {
                font-size: 10px;
                color: #999;
                margin-top: 2px;
            }

            /* Footer */
            .footer {
                margin-top: 28px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 18px 24px;
                background: #f0fdf4;
                border-radius: 12px;
                border: 1px solid #bbf7d0;
            }
            .footer-left {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .footer-badge {
                font-size: 10px;
                font-weight: 800;
                color: #166534;
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            .footer-right {
                font-size: 11px;
                color: #6b7280;
            }

            /* Disclaimer */
            .disclaimer {
                margin-top: 24px;
                padding: 16px 20px;
                background: #fefce8;
                border-radius: 10px;
                border: 1px solid #fef08a;
                font-size: 11px;
                color: #854d0e;
                line-height: 1.6;
            }
            .disclaimer strong {
                display: block;
                margin-bottom: 4px;
                font-size: 10px;
                letter-spacing: 1px;
                text-transform: uppercase;
            }

            /* Watermark */
            .watermark {
                text-align: center;
                margin-top: 32px;
                font-size: 10px;
                color: #d1d5db;
                letter-spacing: 2px;
                font-weight: 700;
            }
        </style>
    </head>
    <body>
        <div class="page">
            <!-- Header -->
            <div class="header">
                <div class="header-left">
                    <h1>🐾 Vaccination Passport</h1>
                    <div class="subtitle">Official Pet Health Document — PetCare App</div>
                </div>
                <div class="header-right">
                    <div class="date-label">Generated on</div>
                    <div>${today}</div>
                </div>
            </div>

            <!-- Pet Info -->
            <div class="pet-card">
                <div class="pet-info-grid">
                    <div class="info-item">
                        <span class="info-label">Pet Name</span>
                        <span class="info-value">${pet.name || 'Unknown'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Breed</span>
                        <span class="info-value">${pet.breed || '—'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Age</span>
                        <span class="info-value">${pet.age ? `${pet.age} yrs` : '—'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Weight</span>
                        <span class="info-value">${pet.weight ? `${pet.weight} kg` : '—'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Owner</span>
                        <span class="info-value">${ownerName || '—'}</span>
                    </div>
                </div>
                <div class="paw-icon">🐾</div>
            </div>

            <!-- Vaccination Table -->
            <div class="table-title">
                <span class="icon">💉</span> Vaccination Records (${vaccinations.length})
            </div>

            ${vaccinations.length === 0 ? `
                <div style="text-align: center; padding: 40px; color: #999; font-size: 14px;">
                    No vaccinations have been recorded yet.
                </div>
            ` : `
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Vaccine</th>
                            <th>Administered</th>
                            <th>Next Due</th>
                            <th>Veterinarian</th>
                            <th>Clinic</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vaccinationRows}
                    </tbody>
                </table>
            `}

            <!-- Verified Footer -->
            <div class="footer">
                <div class="footer-left">
                    <span style="font-size: 20px;">✅</span>
                    <span class="footer-badge">Verified Digital Record</span>
                </div>
                <div class="footer-right">
                    Total Vaccinations: <strong>${vaccinations.length}</strong>
                </div>
            </div>

            <!-- Disclaimer -->
            <div class="disclaimer">
                <strong>⚠️ Disclaimer</strong>
                This document is generated from records entered into the PetCare application.
                It is intended for personal use only and does not substitute for official veterinary documentation.
                Always consult with your veterinarian for verified vaccination certificates.
            </div>

            <div class="watermark">PETCARE APP — DIGITAL VACCINATION PASSPORT</div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Generate and share/download a Vaccination Passport PDF.
 *
 * @param {Object} pet - The pet object (name, breed, age, weight, etc.)
 * @param {Array} vaccinations - Array of vaccination records
 * @param {string} ownerName - The owner's name
 */
export const generateVaccinationPassportPDF = async (pet, vaccinations, ownerName) => {
    try {
        const html = buildHTML(pet, vaccinations, ownerName);

        // Generate PDF file
        const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
        });

        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
            Alert.alert('Sharing Not Available', 'Sharing is not supported on this device.');
            return;
        }

        // Share/download the PDF
        await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `${pet.name || 'Pet'} - Vaccination Passport`,
            UTI: 'com.adobe.pdf',
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        Alert.alert('Error', 'Could not generate PDF. Please try again.');
    }
};
