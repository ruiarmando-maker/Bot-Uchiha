// src/middleware/roleCheck.js - Role-based access control middleware

export const checkRole = (requiredRole) => {
    return async (sock, message, args) => {
        const userId = message.key.participant || message.key.remoteJid;
        const userRole = getUserRole(userId);
        
        if (!hasPermission(userRole, requiredRole)) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Você não tem permissão para usar este comando!'
            });
            return false;
        }
        return true;
    };
};

const hasPermission = (userRole, requiredRole) => {
    const roles = { USER: 0, VIP: 1, ADM: 2, OWNER: 3 };
    return roles[userRole] >= roles[requiredRole];
};

const getUserRole = (userId) => {
    return 'USER';
};

export default checkRole;
