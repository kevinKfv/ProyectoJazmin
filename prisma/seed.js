const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando la siembra de datos de prueba para SewStudio...');

  // 1. Limpiar datos existentes (en orden respetando claves foráneas)
  console.log('🧹 Limpiando base de datos previa...');
  await prisma.projectEquipment.deleteMany({});
  await prisma.equipment.deleteMany({});
  await prisma.fixedExpense.deleteMany({});
  await prisma.workshopSettings.deleteMany({});
  await prisma.aiRequest.deleteMany({});
  await prisma.label.deleteMany({});
  await prisma.patternVersion.deleteMany({});
  await prisma.pattern.deleteMany({});
  await prisma.projectMaterial.deleteMany({});
  await prisma.inventoryMovement.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.fitSession.deleteMany({});
  await prisma.measurementHistory.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Crear Usuarios de prueba
  console.log('👤 Creando usuario principal...');
  const user = await prisma.user.create({
    data: {
      id: 'user_jazmin_demo',
      name: 'Jazmín Costura',
      email: 'jazmin@sewstudio.com',
      role: 'ADMIN',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'user_maria_demo',
      name: 'María Modista',
      email: 'maria@sewstudio.com',
      role: 'USER',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop',
    },
  });

  console.log(`✅ Usuarios creados: ${user.name} (${user.email}), ${user2.name} (${user2.email})`);

  // 2.1 Configuración del Taller, Maquinaria y Gastos Fijos para el usuario de prueba
  console.log('⚙️ Creando configuración de taller, maquinaria y gastos fijos...');
  const settings = await prisma.workshopSettings.create({
    data: {
      userId: user.id,
      monthlyWorkingHours: 160,
      hourlyLaborRate: 18.50,
      electricityRateKwh: 0.18,
      wholesaleMarginPct: 40,
      retailMarginPct: 100,
    }
  });

  const eqOverlock = await prisma.equipment.create({
    data: {
      userId: user.id,
      name: 'Overlock 4 Hilos Industrial Heavy-Duty',
      purchasePrice: 680,
      usefulLifeHours: 6000,
      maintenanceCost: 150,
      powerWatts: 550,
      electricityRateKwh: 0.18,
      hourlyWearCost: 0.138,
      hourlyEnergyCost: 0.099,
      hourlyRate: 0.237,
      notes: 'Calibrada para telas medianas y elásticas.',
    }
  });

  const eqRecta = await prisma.equipment.create({
    data: {
      userId: user.id,
      name: 'Máquina Recta Industrial Automática',
      purchasePrice: 520,
      usefulLifeHours: 8000,
      maintenanceCost: 100,
      powerWatts: 400,
      electricityRateKwh: 0.18,
      hourlyWearCost: 0.077,
      hourlyEnergyCost: 0.072,
      hourlyRate: 0.149,
      notes: 'Corte de hilo automático y atracado digital.',
    }
  });

  const eqCollareta = await prisma.equipment.create({
    data: {
      userId: user.id,
      name: 'Collareta Industrial Tapa Costuras',
      purchasePrice: 780,
      usefulLifeHours: 6000,
      maintenanceCost: 180,
      powerWatts: 550,
      electricityRateKwh: 0.18,
      hourlyWearCost: 0.160,
      hourlyEnergyCost: 0.099,
      hourlyRate: 0.259,
      notes: 'Guiador de cuellos y dobladillos de punto.',
    }
  });

  const eqPlancha = await prisma.equipment.create({
    data: {
      userId: user.id,
      name: 'Plancha Industrial a Vapor con Caldera',
      purchasePrice: 380,
      usefulLifeHours: 4000,
      maintenanceCost: 90,
      powerWatts: 1600,
      electricityRateKwh: 0.18,
      hourlyWearCost: 0.117,
      hourlyEnergyCost: 0.288,
      hourlyRate: 0.405,
      notes: 'Presión de vapor 3.5 bar.',
    }
  });

  await prisma.fixedExpense.createMany({
    data: [
      { userId: user.id, name: 'Alquiler del Taller de Costura', monthlyCost: 280.00 },
      { userId: user.id, name: 'Servicio de Luz / Electricidad Base', monthlyCost: 75.00 },
      { userId: user.id, name: 'Internet de Alta Velocidad & Teléfono', monthlyCost: 40.00 },
      { userId: user.id, name: 'Agua & Mantenimiento Local', monthlyCost: 25.00 },
    ]
  });

  // 2.2 Crear Proveedores de Prueba e Historial de Precios
  console.log('🏬 Creando directorio de proveedores e historial de precios...');
  const supTextilesSur = await prisma.supplier.create({
    data: {
      userId: user.id,
      name: 'Textiles del Sur S.A.',
      contactName: 'Carlos Gómez',
      phone: '+5491143218765',
      email: 'ventas@textilesdelsur.com',
      address: 'Av. Corrientes 1234, CABA',
      rating: 5,
      notes: 'Excelente calidad en linos y algodones. Descuento del 10% en compras superiores a 50 metros.',
      priceHistory: {
        create: [
          { materialName: 'Tela Lino Natural Beige', unit: 'm', pricePerUnit: 14.50, notes: 'Compra lote julio 2026' },
          { materialName: 'Tela Lino Natural Beige', unit: 'm', pricePerUnit: 13.80, notes: 'Compra lote marzo 2026' },
          { materialName: 'Algodón Estampado Floral', unit: 'm', pricePerUnit: 11.20, notes: 'Precio temporada primavera' },
        ]
      }
    }
  });

  const supSederias = await prisma.supplier.create({
    data: {
      userId: user.id,
      name: 'Sederías Elegance Import',
      contactName: 'Elena Rossi',
      phone: '+5491156781234',
      email: 'contacto@sederiaselegance.com',
      address: 'Calle Lavalle 850, CABA',
      rating: 5,
      notes: 'Proveedor exclusivo de sedas de alta costura, satenes brillantes y brocados.',
      priceHistory: {
        create: [
          { materialName: 'Seda Satén Esmeralda', unit: 'm', pricePerUnit: 28.00, notes: 'Importación Italia julio 2026' },
          { materialName: 'Seda Satén Esmeralda', unit: 'm', pricePerUnit: 26.50, notes: 'Lote anterior enero 2026' },
        ]
      }
    }
  });

  const supMerceria = await prisma.supplier.create({
    data: {
      userId: user.id,
      name: 'Mercería Central & Botonera Artesanal',
      contactName: 'Mario Pérez',
      phone: '+5491133221100',
      email: 'pedidos@merceriacentral.com',
      address: 'Av. Belgrano 450, CABA',
      rating: 4,
      notes: 'Distribuidor oficial de hilos Gütermann, cremalleras invisibles YKK y botones de madera.',
      priceHistory: {
        create: [
          { materialName: 'Hilo Gütermann Poliéster Beige 1000m', unit: 'bobinas', pricePerUnit: 4.50, notes: 'Precio catálogo 2026' },
          { materialName: 'Cremallera Invisible 50cm Beige', unit: 'unidades', pricePerUnit: 1.25, notes: 'Precio por caja de 50' },
        ]
      }
    }
  });

  const supLanera = await prisma.supplier.create({
    data: {
      userId: user.id,
      name: 'Lanera Central Argentina',
      contactName: 'Gabriel Lanusse',
      phone: '+5491188776655',
      email: 'info@laneracentral.com.ar',
      address: 'Av. Córdoba 3400, CABA',
      rating: 5,
      notes: 'Especialistas en lanas merino virgen de la Patagonia y mezclas para sastrería fina.',
      priceHistory: {
        create: [
          { materialName: 'Lana Merino Gris Melange', unit: 'm', pricePerUnit: 35.00, notes: 'Colección Otoño-Invierno 2026' }
        ]
      }
    }
  });

  // 3. Crear Inventario de Materiales
  console.log('🧵 Creando catálogo de materiales en inventario...');
  const matLino = await prisma.material.create({
    data: {
      userId: user.id,
      supplierId: supTextilesSur.id,
      name: 'Tela Lino Natural Beige',
      category: 'Tela',
      quantity: 15.5,
      unit: 'm',
      costPerUnit: 14.50,
      supplier: supTextilesSur.name,
      location: 'Estante A1 - Rollo 3',
      reorderLevel: 5.0,
      qrCode: 'QR-LINO-BEIGE-001',
      barcode: '7791234567890',
      shrinkageRatePct: 5.0,
      usableQuantity: 14.72,
      imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&auto=format&fit=crop',
    },
  });

  const matSaten = await prisma.material.create({
    data: {
      userId: user.id,
      supplierId: supSederias.id,
      name: 'Seda Satén Esmeralda',
      category: 'Tela',
      quantity: 4.0,
      unit: 'm',
      costPerUnit: 28.00,
      supplier: supSederias.name,
      location: 'Estante A2 - Rollo 1',
      reorderLevel: 3.0,
      qrCode: 'QR-SATEN-ESMERALDA-002',
      barcode: '7791234567891',
      shrinkageRatePct: 2.0,
      usableQuantity: 3.92,
      imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&auto=format&fit=crop',
    },
  });

  const matFloral = await prisma.material.create({
    data: {
      userId: user.id,
      supplierId: supTextilesSur.id,
      name: 'Algodón Estampado Floral',
      category: 'Tela',
      quantity: 8.5,
      unit: 'm',
      costPerUnit: 11.20,
      supplier: supTextilesSur.name,
      location: 'Estante A3 - Rollo 7',
      reorderLevel: 4.0,
      qrCode: 'QR-ALGODON-FLORAL-003',
      barcode: '7791234567892',
      shrinkageRatePct: 4.0,
      usableQuantity: 8.16,
      imageUrl: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?w=500&auto=format&fit=crop',
    },
  });

  const matLana = await prisma.material.create({
    data: {
      userId: user.id,
      supplierId: supLanera.id,
      name: 'Lana Merino Gris Melange',
      category: 'Tela',
      quantity: 6.0,
      unit: 'm',
      costPerUnit: 35.00,
      supplier: supLanera.name,
      location: 'Estante A4 - Rollo 2',
      reorderLevel: 5.0,
      qrCode: 'QR-LANA-MERINO-004',
      barcode: '7791234567893',
      shrinkageRatePct: 3.0,
      usableQuantity: 5.82,
      imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop',
    },
  });

  const matHiloBeige = await prisma.material.create({
    data: {
      userId: user.id,
      supplierId: supMerceria.id,
      name: 'Hilo Gütermann Poliéster Beige 1000m',
      category: 'Hilo',
      quantity: 5,
      unit: 'bobinas',
      costPerUnit: 4.50,
      supplier: supMerceria.name,
      location: 'Cajón B1',
      reorderLevel: 2,
      qrCode: 'QR-HILO-BEIGE-005',
      barcode: '7791234567894',
      imageUrl: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=500&auto=format&fit=crop',
    },
  });

  const matHiloVerde = await prisma.material.create({
    data: {
      userId: user.id,
      name: 'Hilo Gütermann Verde Esmeralda 500m',
      category: 'Hilo',
      quantity: 1, // Alerta de stock bajo (1 <= 2)
      unit: 'bobinas',
      costPerUnit: 3.80,
      supplier: 'Mercería Central',
      location: 'Cajón B2',
      reorderLevel: 2,
    },
  });

  const matCremalleraBeige = await prisma.material.create({
    data: {
      userId: user.id,
      name: 'Cremallera Invisible 50cm Beige',
      category: 'Cremallera',
      quantity: 12,
      unit: 'unidades',
      costPerUnit: 1.25,
      supplier: 'Mercería Central',
      location: 'Cajón C1',
      reorderLevel: 5,
    },
  });

  const matCremalleraBronce = await prisma.material.create({
    data: {
      userId: user.id,
      name: 'Cremallera Metálica Bronce 20cm',
      category: 'Cremallera',
      quantity: 2, // Alerta de stock bajo (2 <= 5)
      unit: 'unidades',
      costPerUnit: 2.80,
      supplier: 'Mercería Central',
      location: 'Cajón C2',
      reorderLevel: 5,
    },
  });

  const matBotonesMadera = await prisma.material.create({
    data: {
      userId: user.id,
      name: 'Botones Madera Natural 20mm',
      category: 'Botón',
      quantity: 40,
      unit: 'unidades',
      costPerUnit: 0.40,
      supplier: 'Botonera Artesanal',
      location: 'Cajón D1',
      reorderLevel: 15,
    },
  });

  const matElastico = await prisma.material.create({
    data: {
      userId: user.id,
      name: 'Elástico Plano 25mm Blanco',
      category: 'Elástico',
      quantity: 18.0,
      unit: 'm',
      costPerUnit: 0.90,
      supplier: 'Mercería Central',
      location: 'Estante B2',
      reorderLevel: 10,
    },
  });

  const matEntretela = await prisma.material.create({
    data: {
      userId: user.id,
      name: 'Entretela Adhesiva Ligera',
      category: 'Entretela',
      quantity: 7.5,
      unit: 'm',
      costPerUnit: 3.80,
      supplier: 'Textiles del Sur S.A.',
      location: 'Estante A5',
      reorderLevel: 3,
    },
  });

  const matAgujas = await prisma.material.create({
    data: {
      userId: user.id,
      name: 'Agujas Singer Universal 80/12',
      category: 'Agujas',
      quantity: 4,
      unit: 'paquetes',
      costPerUnit: 3.50,
      supplier: 'Mercería Central',
      location: 'Cajón E1',
      reorderLevel: 2,
    },
  });

  console.log('✅ 12 materiales creados en el inventario.');

  // 4. Crear Historial de Movimientos de Inventario
  console.log('📊 Creando movimientos de inventario...');
  await prisma.inventoryMovement.createMany({
    data: [
      {
        materialId: matLino.id,
        type: 'ENTRADA',
        quantity: 20.0,
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        notes: 'Compra inicial lote mayo a Textiles del Sur',
      },
      {
        materialId: matLino.id,
        type: 'SALIDA',
        quantity: 4.5,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        notes: 'Consumo para proyecto Vestido de Verano Lino',
      },
      {
        materialId: matSaten.id,
        type: 'ENTRADA',
        quantity: 7.5,
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        notes: 'Importación especial Seda Elegance',
      },
      {
        materialId: matSaten.id,
        type: 'SALIDA',
        quantity: 3.5,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        notes: 'Confección Vestido Noche Satén Esmeralda',
      },
      {
        materialId: matHiloVerde.id,
        type: 'SALIDA',
        quantity: 2,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: 'Uso intenso en costura de gala',
      },
      {
        materialId: matCremalleraBronce.id,
        type: 'ENTRADA',
        quantity: 5,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        notes: 'Stock inicial de cremalleras metálicas',
      },
      {
        materialId: matCremalleraBronce.id,
        type: 'SALIDA',
        quantity: 3,
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        notes: 'Descuento para accesorios diversos',
      },
    ],
  });

  console.log('✅ Movimientos de historial de inventario registrados.');

  // 5. Crear Proyectos de Costura (Cubriendo todos los estados del Kanban y catálogo)
  console.log('📋 Creando proyectos de prueba...');

  // Proyecto 1: Costura (En progreso - CON ALERTA DE SOBRECOSTO ⚠️)
  const projVestidoLino = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Vestido de Verano Lino Beige',
      category: 'Vestidos',
      status: 'Costura',
      description: 'Vestido midi con escote en V, botonadura frontal de madera y cinturón ajustable confeccionado en lino 100% natural.',
      startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      estimatedHours: 6.0,
      actualHours: 9.5,
      estimatedMaterialsCost: 40.00,
      estimatedLaborHours: 6.0,
      estimatedTotalCost: 166.75, // Presupuesto inicial: $166.75
      actualMaterialsCost: 43.65,
      equipmentCosts: 2.10,
      overheadCosts: 24.93,
      totalCost: 246.43, // Ejecución real: $246.43 -> Sobrecosto de +$79.68 por 3.5h extra
      hourlyLaborRate: 18.50,
      suggestedWholesalePrice: 345.00,
      suggestedRetailPrice: 492.86,
      notes: 'Falta rematar el dobladillo inferior invisible y coser los 6 botones de madera en la aletilla frontal.',
      isPublic: false,
      materials: {
        create: [
          { materialId: matLino.id, quantityUsed: 2.5 },
          { materialId: matHiloBeige.id, quantityUsed: 1.0 },
          { materialId: matBotonesMadera.id, quantityUsed: 6.0 },
          { materialId: matEntretela.id, quantityUsed: 0.5 },
        ],
      },
      equipments: {
        create: [
          { equipmentId: eqOverlock.id, hoursUsed: 3.5, cost: 0.83 },
          { equipmentId: eqRecta.id, hoursUsed: 5.0, cost: 0.75 },
          { equipmentId: eqPlancha.id, hoursUsed: 1.0, cost: 0.41 },
        ]
      }
    },
  });

  // Proyecto 2: Diseño (DENTRO DE PRESUPUESTO ✅)
  const projBlazer = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Blazer Estructurado Lana Gris',
      category: 'Chaquetas',
      status: 'Diseño',
      description: 'Chaqueta blazer de corte sastrería moderna en lana merino gris melange con solapa muesca y bolsillos sastre.',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      estimatedHours: 15.0,
      actualHours: 14.0,
      estimatedMaterialsCost: 90.00,
      estimatedLaborHours: 15.0,
      estimatedTotalCost: 406.88,
      actualMaterialsCost: 83.10,
      equipmentCosts: 3.80,
      overheadCosts: 36.75,
      totalCost: 382.65, // Dentro del presupuesto (-$24.23)
      hourlyLaborRate: 18.50,
      suggestedWholesalePrice: 535.71,
      suggestedRetailPrice: 765.30,
      notes: 'Patrón ajustado en sisa y talle. Pendiente cortar piezas del forro interno de seda.',
      isPublic: false,
      materials: {
        create: [
          { materialId: matLana.id, quantityUsed: 2.2 },
          { materialId: matEntretela.id, quantityUsed: 1.2 },
          { materialId: matBotonesMadera.id, quantityUsed: 4.0 },
        ],
      },
      equipments: {
        create: [
          { equipmentId: eqRecta.id, hoursUsed: 8.0, cost: 1.19 },
          { equipmentId: eqOverlock.id, hoursUsed: 4.0, cost: 0.95 },
          { equipmentId: eqPlancha.id, hoursUsed: 2.0, cost: 0.81 },
        ]
      }
    },
  });

  // Proyecto 3: Finalizado (CON ALERTA DE SOBRECOSTO ⚠️)
  const projVestidoSaten = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Vestido de Noche Satén Esmeralda',
      category: 'Alta Costura',
      status: 'Finalizado',
      description: 'Vestido largo de gala en satén de seda esmeralda con escote drapeado en la espalda y caída fluida al bies.',
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      estimatedHours: 12.0,
      actualHours: 15.5,
      estimatedMaterialsCost: 95.00,
      estimatedLaborHours: 12.0,
      estimatedTotalCost: 348.50,
      actualMaterialsCost: 103.05,
      equipmentCosts: 4.20,
      overheadCosts: 40.68,
      totalCost: 434.68, // Sobrecosto: +$86.18 por 3.5h extra de costura manual al bies
      hourlyLaborRate: 18.50,
      suggestedWholesalePrice: 608.55,
      suggestedRetailPrice: 869.36,
      isPublic: true,
      publicPrice: 869.00,
      publicImageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop',
      notes: 'Entregado satisfechamente para evento de gala. Acabados y costuras al francés hechos a mano.',
      materials: {
        create: [
          { materialId: matSaten.id, quantityUsed: 3.5 },
          { materialId: matHiloVerde.id, quantityUsed: 1.0 },
          { materialId: matCremalleraBeige.id, quantityUsed: 1.0 },
        ],
      },
      equipments: {
        create: [
          { equipmentId: eqRecta.id, hoursUsed: 9.0, cost: 1.34 },
          { equipmentId: eqOverlock.id, hoursUsed: 4.5, cost: 1.06 },
          { equipmentId: eqPlancha.id, hoursUsed: 2.0, cost: 0.81 },
        ]
      }
    },
  });

  // Proyecto 4: Idea
  const projToteBag = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Bolso Tote Bag Algodón Floral',
      category: 'Accesorios',
      status: 'Idea',
      description: 'Bolso de mano ecológico resistente con estampado floral, asas de lino reforzado y bolsillo interior con cremallera.',
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedHours: 4.5,
      actualHours: 0.5,
      totalCost: 22.50,
      notes: 'Boceto de diseño completado. Excelente opción para regalo rápido de primavera.',
      isPublic: false,
      materials: {
        create: [
          { materialId: matFloral.id, quantityUsed: 1.2 },
          { materialId: matLino.id, quantityUsed: 0.6 },
          { materialId: matCremalleraBronce.id, quantityUsed: 1.0 },
        ],
      },
    },
  });

  // Proyecto 5: Corte
  const projFaldaFloral = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Falda Midi Plisada Floral',
      category: 'Faldas',
      status: 'Corte',
      description: 'Falda midi con amplio vuelo en algodón floral con pretina elastizada y bolsillos invisibles en costuras.',
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      estimatedHours: 6.0,
      actualHours: 2.0,
      totalCost: 35.80,
      notes: 'Piezas cortadas con margen de costura de 1.5cm. Siguiente fase: encarar y coser bolsillos.',
      isPublic: false,
      materials: {
        create: [
          { materialId: matFloral.id, quantityUsed: 2.0 },
          { materialId: matElastico.id, quantityUsed: 0.8 },
          { materialId: matHiloBeige.id, quantityUsed: 0.5 },
        ],
      },
    },
  });

  // Proyecto 6: Ajustes
  const projCamisaLino = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Camisa Oversize Lino Blanco',
      category: 'Camisas',
      status: 'Ajustes',
      description: 'Camisa holgada estilo relajado en lino natural con puños anchos y canesú trasero.',
      startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      estimatedHours: 8.0,
      actualHours: 7.5,
      totalCost: 48.20,
      notes: 'Prueba de calce realizada. Ajustando el vuelo del puño y preparando la hilera de 8 botones.',
      isPublic: false,
      materials: {
        create: [
          { materialId: matLino.id, quantityUsed: 2.0 },
          { materialId: matBotonesMadera.id, quantityUsed: 8.0 },
        ],
      },
    },
  });

  // Proyecto 8: Finalizado y publicado en Catálogo Público (Corset & Tutu)
  const projCorsetGala = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Corset Drapeado & Falda Tul Dorado',
      category: 'Alta Costura',
      status: 'Finalizado',
      description: 'Conjunto de corset ballenado con drapeado en tafetán dorado y falda volumétrica de tul multicapa.',
      startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      estimatedHours: 14.0,
      actualHours: 14.0,
      totalCost: 180.00,
      isPublic: true,
      publicPrice: 480.00,
      publicImageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop',
      notes: 'Diseño de gala de alta fidelidad con corset interior entallado.',
    },
  });

  // Proyecto 9: Finalizado y publicado en Catálogo Público (Mono Elegante)
  const projMonoAzul = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Mono de Noche Terciopelo Azul Zafiro',
      category: 'Fiesta',
      status: 'Finalizado',
      description: 'Mono elegante de pernera ancha en terciopelo azul zafiro con escote asimétrico y cinturón ajustado.',
      startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      estimatedHours: 9.0,
      actualHours: 9.0,
      totalCost: 110.00,
      isPublic: true,
      publicPrice: 290.00,
      publicImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop',
      notes: 'Prenda versátil de noche con excelente caída y comodidad.',
    },
  });

  // Proyecto 10: Finalizado y publicado en Catálogo Público (Traje Sastre)
  const projTrajeRosa = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Traje Sastre Blazer & Palazo Rosa Pastel',
      category: 'Sastrería',
      status: 'Finalizado',
      description: 'Conjunto sastre femenino de 2 piezas en crepé rosa pastel con solapa de muesca y corte impecable.',
      startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      estimatedHours: 12.0,
      actualHours: 12.0,
      totalCost: 145.00,
      isPublic: true,
      publicPrice: 420.00,
      publicImageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop',
      notes: 'Tendencia sastrería moderna para eventos de día y gala.',
    },
  });

  console.log('✅ 10 proyectos creados (5 en catálogo público con precios de seña MercadoPago).');

  // 6. Crear Biblioteca de Patrones
  console.log('📐 Creando biblioteca de patrones...');
  const patternVestido = await prisma.pattern.create({
    data: {
      userId: user.id,
      name: 'Patrón Base Vestido Evasé A-Line',
      category: 'Vestidos',
      description: 'Patrón base anatómico de vestido A-Line con pinzas de busto, holguras de costura incluidas e indicaciones de hilo de tela.',
      tags: 'vestido, evase, lino, base, primavera',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop',
      dataJson: JSON.stringify({
        version: '2.0',
        currentSize: 'M',
        gradingEnabled: true,
        fabricWidthCm: 140,
        shapes: [
          {
            id: 'delantero_v1',
            name: 'Delantero Vestido Evasé',
            points: [{ x: 120, y: 100 }, { x: 260, y: 100 }, { x: 310, y: 160 }, { x: 290, y: 240 }, { x: 280, y: 440 }, { x: 120, y: 440 }],
            closed: true,
            stroke: '#2563eb',
            strokeWidth: 2,
            fill: 'rgba(37, 99, 235, 0.08)',
            seamAllowance: 1.5,
          },
          {
            id: 'espalda_v1',
            name: 'Espalda Vestido Evasé',
            points: [{ x: 380, y: 100 }, { x: 520, y: 100 }, { x: 570, y: 170 }, { x: 550, y: 240 }, { x: 540, y: 440 }, { x: 380, y: 440 }],
            closed: true,
            stroke: '#dc2626',
            strokeWidth: 2,
            fill: 'rgba(220, 38, 38, 0.08)',
            seamAllowance: 1.5,
          }
        ],
        textElements: [
          { id: 't1', text: 'Delantero Talla M (Cortar 1 al doblez)', x: 140, y: 120, fontSize: 14, fill: '#1e293b' },
          { id: 't2', text: 'Espalda Talla M (Cortar 2 al hilo)', x: 400, y: 120, fontSize: 14, fill: '#1e293b' }
        ]
      }),
      versions: {
        create: [
          { versionNumber: '1.0', format: 'PDF', fileUrl: '/uploads/patterns/vestido_evase_v1.pdf' },
          { versionNumber: '1.1', format: 'SVG', fileUrl: '/uploads/patterns/vestido_evase_v1.1.svg' },
        ],
      },
    },
  });

  const patternBlazer = await prisma.pattern.create({
    data: {
      userId: user.id,
      name: 'Patrón Blazer Sastre Femenino Talla M',
      category: 'Chaquetas',
      description: 'Patrón técnico de blazer estructurado con manga sastre de 2 piezas, solapa en escuadra y cartera de bolsillo.',
      tags: 'blazer, sastre, lana, formal, chaqueta',
      imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop',
      dataJson: JSON.stringify({
        version: '2.0',
        shapes: [
          {
            id: 'canesu_b1',
            name: 'Canesú Delantero Blazer',
            points: [{ x: 100, y: 80 }, { x: 260, y: 80 }, { x: 280, y: 320 }, { x: 100, y: 320 }],
            closed: true,
            stroke: '#059669',
            strokeWidth: 2,
            fill: 'rgba(5, 150, 105, 0.08)',
            seamAllowance: 1.5,
          },
          {
            id: 'manga_b1',
            name: 'Manga Sastre Superior',
            points: [{ x: 320, y: 100 }, { x: 440, y: 60 }, { x: 500, y: 120 }, { x: 470, y: 420 }, { x: 340, y: 420 }],
            closed: true,
            stroke: '#d97706',
            strokeWidth: 2,
            fill: 'rgba(217, 119, 6, 0.08)',
            seamAllowance: 1.5,
          }
        ],
        textElements: [
          { id: 'tb1', text: 'Delantero Blazer Talla M', x: 120, y: 110, fontSize: 15, fill: '#065f46' },
          { id: 'tb2', text: 'Manga Sastre Talla M', x: 360, y: 120, fontSize: 15, fill: '#92400e' }
        ]
      }),
      versions: {
        create: [
          { versionNumber: '2.0', format: 'PDF', fileUrl: '/uploads/patterns/blazer_sastre_v2.pdf' },
        ],
      },
    },
  });

  const patternFalda = await prisma.pattern.create({
    data: {
      userId: user.id,
      name: 'Patrón Falda Midi Acampanada',
      category: 'Faldas',
      description: 'Falda de 6 paños acampanados con pretina anatómica y marcas para bolsillos ocultos.',
      tags: 'falda, midi, acampanada, bolsillos',
      imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop',
      dataJson: JSON.stringify({
        version: '1.0',
        canvasWidth: 800,
        canvasHeight: 600,
        elements: [
          { type: 'path', id: 'paño', points: [[200, 80], [350, 80], [420, 500], [130, 500]], stroke: '#7c3aed', strokeWidth: 2 }
        ]
      }),
      versions: {
        create: [
          { versionNumber: '1.0', format: 'SVG', fileUrl: '/uploads/patterns/falda_midi_v1.svg' },
        ],
      },
    },
  });

  console.log('✅ Patrones creados con versiones PDF y SVG.');

  // 7. Crear Diseños de Etiquetas
  console.log('🏷️ Creando plantillas de etiquetas...');
  await prisma.label.create({
    data: {
      userId: user.id,
      name: 'Etiqueta de Marca SewStudio Premium',
      type: 'Marca',
      designJson: JSON.stringify({
        width: 300,
        height: 150,
        background: '#18181b',
        elements: [
          { type: 'text', text: 'SEWSTUDIO', fontSize: 22, color: '#f43f5e', fontFamily: 'sans-serif', x: 75, y: 40 },
          { type: 'text', text: 'Alta Costura & Patronaje', fontSize: 12, color: '#a1a1aa', fontFamily: 'sans-serif', x: 65, y: 75 },
          { type: 'text', text: '100% Hecho a Mano', fontSize: 10, color: '#e4e4e7', fontFamily: 'sans-serif', x: 95, y: 105 },
        ],
      }),
    },
  });

  await prisma.label.create({
    data: {
      userId: user.id,
      name: 'Etiqueta de Lavado & Cuidado Lino',
      type: 'Lavado',
      designJson: JSON.stringify({
        width: 250,
        height: 350,
        background: '#ffffff',
        elements: [
          { type: 'text', text: 'CUIDADO Y LAVADO', fontSize: 16, color: '#000000', fontFamily: 'sans-serif', x: 45, y: 30 },
          { type: 'text', text: '• Lavar a mano a máx 30°C', fontSize: 12, color: '#3f3f46', fontFamily: 'sans-serif', x: 25, y: 80 },
          { type: 'text', text: '• No usar blanqueadores', fontSize: 12, color: '#3f3f46', fontFamily: 'sans-serif', x: 25, y: 120 },
          { type: 'text', text: '• Planchado a temperatura media', fontSize: 12, color: '#3f3f46', fontFamily: 'sans-serif', x: 25, y: 160 },
          { type: 'text', text: '• Secar a la sombra', fontSize: 12, color: '#3f3f46', fontFamily: 'sans-serif', x: 25, y: 200 },
        ],
      }),
    },
  });

  await prisma.label.create({
    data: {
      userId: user.id,
      name: 'Etiqueta QR Producto Catálogo',
      type: 'QR',
      designJson: JSON.stringify({
        width: 280,
        height: 200,
        background: '#fafafa',
        elements: [
          { type: 'text', text: 'Escanear para ver Colección', fontSize: 13, color: '#18181b', fontFamily: 'sans-serif', x: 40, y: 20 },
          { type: 'qr', value: 'https://sewstudio.app/catalogo', size: 100, x: 90, y: 55 },
          { type: 'text', text: 'SKU: SEW-2026-001', fontSize: 11, color: '#71717a', fontFamily: 'sans-serif', x: 75, y: 165 },
        ],
      }),
    },
  });

  console.log('✅ Etiquetas de prueba creadas.');

  // 8. Crear Consultas de Asistente IA
  console.log('🤖 Creando historial de IA Asistente de costura...');
  await prisma.aiRequest.createMany({
    data: [
      {
        userId: user.id,
        prompt: '¿Cuál es la tensión ideal e hilo recomendado para coser satén de seda sin fruncir la tela?',
        response: `Para coser satén de seda perfectamente sin fruncido ni enganches:
1. **Aguja:** Utiliza aguja Microtex o punta fina número 70/10 o 65/9.
2. **Hilo:** Hilo 100% poliéster fino de alta densidad (Gütermann o Mettler).
3. **Tensión:** Disminuye la tensión superior ligeramente (rango 3.0 - 3.5).
4. **Puntada:** Puntada recta de 2.0mm a 2.5mm.
5. **Tip Pro:** Sostén la tela suavemente tensada por delante y por detrás del prensatelas mientras avanzas.`,
        tokens: 185,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        prompt: '¿Cómo calculo la holgura y el margen de costura recomendado para un blazer estructurado de lana?',
        response: `Para un blazer estructurado de lana merino:
• **Holgura en pecho:** Añade entre 8cm y 10cm sobre la medida justa del contorno de pecho.
• **Holgura en cintura:** 6cm a 8cm.
• **Margen de costura:** 1.5cm en costuras principales y sisa; 4cm a 5cm en dobladillo inferior y puños.
• **Entretela:** Entretela fusionable tejida en todo el delantero, canesú y solapa para firmeza.`,
        tokens: 220,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Consultas de IA generadas.');

  // 9. Crear Clientes, Historial de Medidas, Citas de Calce y Presupuestos (CRM Textil)
  console.log('👤 Creando clientes de prueba y fichas de medidas anatómicas...');
  
  const clientLucia = await prisma.client.create({
    data: {
      id: 'client_lucia_demo',
      userId: user.id,
      name: 'Lucía Fernández',
      email: 'lucia.fernandez@gmail.com',
      phone: '+5491154328765',
      address: 'Av. Santa Fe 2450, 4B, CABA',
      notes: 'Cliente habitual de vestidos de fiesta. Prefiere tonos pastel y calce entallado en cintura.',
      measurements: {
        create: [
          {
            recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Hace 1 mes
            notes: 'Primera toma de medidas para Vestido de Noche en Satén',
            dataJson: JSON.stringify({
              busto: 92,
              bajoBusto: 76,
              cintura: 70,
              cadera: 98,
              altoBusto: 26,
              separacionBusto: 19,
              talleDelantero: 44,
              talleEspalda: 41,
              anchoHombro: 12,
              anchoEspalda: 36,
              largoManga: 58,
              contornoBrazo: 28,
              contornoMuneca: 16,
              contornoCuello: 35,
              alturaCadera: 20,
              tiro: 68,
              contornoMuslo: 56,
              entrepierna: 78,
              contornoTobillo: 22,
              largoTotal: 145,
              alturaRodilla: 52
            })
          },
          {
            recordedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Hace 5 días
            notes: 'Revisión y ajuste previo a 2ª prueba (Reducción de 2cm en cintura)',
            dataJson: JSON.stringify({
              busto: 91.5,
              bajoBusto: 75,
              cintura: 68,
              cadera: 97.5,
              altoBusto: 26,
              separacionBusto: 19,
              talleDelantero: 44,
              talleEspalda: 41,
              anchoHombro: 12,
              anchoEspalda: 36,
              largoManga: 58,
              contornoBrazo: 27.5,
              contornoMuneca: 16,
              contornoCuello: 35,
              alturaCadera: 20,
              tiro: 67.5,
              contornoMuslo: 55,
              entrepierna: 78,
              contornoTobillo: 22,
              largoTotal: 145,
              alturaRodilla: 52
            })
          }
        ]
      },
      fitSessions: {
        create: [
          {
            title: 'Primera Prueba de Calce',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            status: 'COMPLETADA',
            reminderSent: true,
            notes: 'Prueba de lienzo/toile de algodón. Ajustar pinzas de busto 1cm.',
            projectId: projVestidoSaten.id
          },
          {
            title: 'Segunda Prueba de Calce',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // En 2 días
            status: 'CONFIRMADA',
            reminderSent: true,
            notes: 'Prueba en tela real (Satén Esmeralda). Verificar caída y largo de ruedo con tacos.',
            projectId: projVestidoSaten.id
          },
          {
            title: 'Entrega Final de Prenda',
            date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // En 8 días
            status: 'PENDIENTE',
            notes: 'Entrega en funda con percha de madera.',
            projectId: projVestidoSaten.id
          }
        ]
      },
      quotes: {
        create: [
          {
            quoteNumber: 'PRES-2026-001',
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            itemsJson: JSON.stringify([
              { description: 'Confección a Medida: Vestido Largo de Gala Satén Esmeralda', quantity: 1, price: 180000, total: 180000 },
              { description: 'Insumos y Forrería Premium de Seda', quantity: 1, price: 40000, total: 40000 }
            ]),
            subtotal: 220000,
            discount: 10000,
            total: 210000,
            depositPaid: 105000, // 50% de seña
            balanceDue: 105000,
            paymentStatus: 'SENA_50',
            status: 'ENVIADO',
            notes: 'Seña abonada mediante transferencia bancaria. Saldo a saldar contra entrega final.'
          }
        ]
      }
    }
  });

  const clientValentina = await prisma.client.create({
    data: {
      id: 'client_valentina_demo',
      userId: user.id,
      name: 'Valentina Gómez',
      email: 'valentina.gomez@hotmail.com',
      phone: '+5491132109876',
      address: 'Calle Corrientes 1580, 2A, CABA',
      notes: 'Solicita Blazer de Lana Merino para evento corporativo de invierno.',
      measurements: {
        create: [
          {
            recordedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            notes: 'Toma inicial de medidas para Blazer Estructurado',
            dataJson: JSON.stringify({
              busto: 88,
              bajoBusto: 74,
              cintura: 66,
              cadera: 94,
              altoBusto: 25,
              separacionBusto: 18,
              talleDelantero: 43,
              talleEspalda: 40,
              anchoHombro: 13,
              anchoEspalda: 37,
              largoManga: 60,
              contornoBrazo: 26,
              contornoMuneca: 15.5,
              contornoCuello: 34,
              alturaCadera: 19.5,
              tiro: 66,
              contornoMuslo: 53,
              entrepierna: 76,
              contornoTobillo: 21,
              largoTotal: 72,
              alturaRodilla: 50
            })
          }
        ]
      },
      fitSessions: {
        create: [
          {
            title: 'Primera Prueba de Calce',
            date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            status: 'PENDIENTE',
            notes: 'Probar hilván de mangas y caída de hombreras.',
            projectId: projBlazer.id
          }
        ]
      },
      quotes: {
        create: [
          {
            quoteNumber: 'PRES-2026-002',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            itemsJson: JSON.stringify([
              { description: 'Confección Sastrería a Medida: Blazer Lana Merino', quantity: 1, price: 160000, total: 160000 },
              { description: 'Lana Merino Gris Melange 2.2m', quantity: 1, price: 35000, total: 35000 }
            ]),
            subtotal: 195000,
            discount: 0,
            total: 195000,
            depositPaid: 195000,
            balanceDue: 0,
            paymentStatus: 'PAGADO_TOTAL',
            status: 'APROBADO',
            notes: 'Abonado 100% por adelantado.'
          },
          {
            quoteNumber: 'RES-MP-849201',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            itemsJson: JSON.stringify([
              { description: 'Reserva & Encargo de Prenda: Vestido de Noche Satén Esmeralda', qty: 1, price: 869.00, total: 869.00, sizeNotes: 'Talle M - Ajustado a cintura' }
            ]),
            subtotal: 869.00,
            discount: 0,
            total: 869.00,
            depositPaid: 434.50,
            balanceDue: 434.50,
            paymentStatus: 'SENA_50',
            status: 'APROBADO',
            projectId: projVestidoSaten.id,
            notes: 'Reserva abonada con MercadoPago (ID Pago: MP-PAY-982341209). Observaciones de talle: Talle M con entalle en cintura.'
          }
        ]
      }
    }
  });

  console.log(`✅ 2 Clientes creados con medidas anatómicas, historial, citas y presupuestos: ${clientLucia.name}, ${clientValentina.name}`);

  console.log('\n🎉 ¡Siembra de datos de prueba completada con éxito!');
  console.log('----------------------------------------------------');
  console.log(' Credenciales de usuario para pruebas:');
  console.log(' 📧 Email: jazmin@sewstudio.com');
  console.log(' 🔑 Contraseña: (cualquier contraseña funciona en dev local)');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
