const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function init() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('📦 Base de datos vacía detectada. Inicializando datos de prueba (seed)...');
      // Importar dinámicamente o ejecutar prisma/seed.js
      const { execSync } = require('child_process');
      execSync('node prisma/seed.js', { stdio: 'inherit' });
      console.log('✅ Datos iniciales cargados con éxito.');
    } else {
      console.log(`✅ Base de datos existente detectada (${userCount} usuarios registrados).`);
      console.log('💾 Todos tus cambios y trabajos previos están preservados.');
    }
  } catch (error) {
    console.warn('Nota sobre inicialización de base de datos:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

init();
