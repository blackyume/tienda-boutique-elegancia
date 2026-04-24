// Helper singleton para inicializar Firebase Admin en serverless.
// Requiere env var FIREBASE_SERVICE_ACCOUNT = JSON completo del service account.
const admin = require('firebase-admin');

let initialized = false;

const init = () => {
    if (initialized || admin.apps.length > 0) return;
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var no configurada');
    let svc;
    try {
        svc = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
        throw new Error('FIREBASE_SERVICE_ACCOUNT no es JSON válido');
    }
    admin.initializeApp({
        credential: admin.credential.cert(svc),
        projectId: svc.project_id
    });
    initialized = true;
};

const getDb = () => {
    init();
    return admin.firestore();
};

module.exports = { admin, init, getDb };
