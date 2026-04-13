const pool = require("./db_config");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...");

    // Clean existing data (in reverse foreign key dependency order)
    console.log("🗑️  Clearing existing data...");
    const tables = [
      "audit_logs",
      "fault_reports",
      "maintenance_records",
      "asset_movements",
      "asset_disposals",
      "asset_assignments",
      "assets",
      "asset_categories",
      "suppliers",
      "user_roles",
      "profiles",
      "users",
      "departments",
      "roles",
    ];

    for (const table of tables) {
      await pool.query(`TRUNCATE TABLE ${table} CASCADE`);
    }

    // 1. Create Roles
    console.log("📋 Creating roles...");
    const roles = [
      { id: uuidv4(), role_name: "admin", description: "System Administrator" },
      { id: uuidv4(), role_name: "asset_manager", description: "Asset Manager" },
      { id: uuidv4(), role_name: "technician", description: "Technician" },
      { id: uuidv4(), role_name: "department_head", description: "Department Head" },
      { id: uuidv4(), role_name: "staff", description: "General Staff" },
    ];

    for (const role of roles) {
      await pool.query(
        `INSERT INTO roles (id, role_name, description, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())`,
        [role.id, role.role_name, role.description]
      );
    }

    const adminRoleId = roles[0].id;
    const assetManagerRoleId = roles[1].id;
    const technicianRoleId = roles[2].id;
    const departmentHeadRoleId = roles[3].id;
    const staffRoleId = roles[4].id;

    // 2. Create Departments
    console.log("🏢 Creating departments...");
    const departments = [
      {
        id: uuidv4(),
        department_name: "Medical Ward",
        location: "Building A, Floor 2",
        head_of_department: "Dr. James Kali",
        contact: "+256-701-123-456",
      },
      {
        id: uuidv4(),
        department_name: "Radiology",
        location: "Building B, Floor 1",
        head_of_department: "Dr. Sarah Nakato",
        contact: "+256-702-234-567",
      },
      {
        id: uuidv4(),
        department_name: "Laboratory",
        location: "Building C, Ground Floor",
        head_of_department: "Mr. Joseph Mwase",
        contact: "+256-703-345-678",
      },
      {
        id: uuidv4(),
        department_name: "Surgery",
        location: "Building A, Floor 3",
        head_of_department: "Prof. Peter Okwaka",
        contact: "+256-704-456-789",
      },
      {
        id: uuidv4(),
        department_name: "Administration",
        location: "Building D, Ground Floor",
        head_of_department: "Ms. Grace Atim",
        contact: "+256-705-567-890",
      },
    ];

    for (const dept of departments) {
      await pool.query(
        `INSERT INTO departments (id, department_name, location, head_of_department, contact, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [dept.id, dept.department_name, dept.location, dept.head_of_department, dept.contact]
      );
    }

    // 3. Create Users
    console.log("👥 Creating users...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const users = [
      {
        user_id: uuidv4(),
        full_name: "Admin User",
        username: "admin",
        email: "admin@mrrh.local",
        password: adminPassword,
        phone_number: "+256-701-000-001",
        role_id: "admin",
        department_id: departments[4].id,
        status: "active",
      },
      {
        user_id: uuidv4(),
        full_name: "Asset Manager",
        username: "asset_manager",
        email: "manager@mrrh.local",
        password: userPassword,
        phone_number: "+256-702-000-002",
        role_id: "asset_manager",
        department_id: departments[4].id,
        status: "active",
      },
      {
        user_id: uuidv4(),
        full_name: "John Technician",
        username: "technician1",
        email: "technician@mrrh.local",
        password: userPassword,
        phone_number: "+256-703-000-003",
        role_id: "technician",
        department_id: departments[0].id,
        status: "active",
      },
      {
        user_id: uuidv4(),
        full_name: "Dr. James Kali",
        username: "dr_kali",
        email: "kali@mrrh.local",
        password: userPassword,
        phone_number: "+256-701-123-456",
        role_id: "department_head",
        department_id: departments[0].id,
        status: "active",
      },
      {
        user_id: uuidv4(),
        full_name: "Nurse Mary",
        username: "nurse_mary",
        email: "mary@mrrh.local",
        password: userPassword,
        phone_number: "+256-704-000-005",
        role_id: "staff",
        department_id: departments[0].id,
        status: "active",
      },
    ];

    const createdUsers = [];
    for (const user of users) {
      await pool.query(
        `INSERT INTO users (user_id, full_name, username, email, password, phone_number, role_id, department_id, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          user.user_id,
          user.full_name,
          user.username,
          user.email,
          user.password,
          user.phone_number,
          user.role_id,
          user.department_id,
          user.status,
        ]
      );
      createdUsers.push(user);
    }

    // 4. Create Asset Categories
    console.log("🏷️  Creating asset categories...");
    const categories = [
      { id: uuidv4(), category_name: "Medical Equipment", description: "Medical and diagnostic equipment" },
      { id: uuidv4(), category_name: "Computer & IT", description: "Computers, servers, networking equipment" },
      { id: uuidv4(), category_name: "Furniture", description: "Beds, chairs, tables, cabinets" },
      { id: uuidv4(), category_name: "Vehicles", description: "Ambulances, vans, motorcycles" },
      { id: uuidv4(), category_name: "Laboratory Supplies", description: "Lab equipment and instruments" },
    ];

    for (const cat of categories) {
      await pool.query(
        `INSERT INTO asset_categories (id, category_name, description) VALUES ($1, $2, $3)`,
        [cat.id, cat.category_name, cat.description]
      );
    }

    // 5. Create Suppliers
    console.log("🏪 Creating suppliers...");
    const suppliers = [
      {
        id: uuidv4(),
        supplier_name: "Medical Solutions Ltd",
        contact_person: "Mr. Hassan Ahmed",
        phone: "+256-701-555-001",
        email: "sales@medicalsolutions.ug",
        address: "Plot 123, Kampala Road, Kampala",
      },
      {
        id: uuidv4(),
        supplier_name: "Tech Supplies Uganda",
        contact_person: "Ms. Venus Nakyambadde",
        phone: "+256-702-555-002",
        email: "info@techsupplies.ug",
        address: "Nile Avenue, Kampala",
      },
      {
        id: uuidv4(),
        supplier_name: "General Supplies Co",
        contact_person: "Mr. Frank Mwebaze",
        phone: "+256-703-555-003",
        email: "orders@generalsupplies.ug",
        address: "Industrial Area, Jinja",
      },
    ];

    for (const supplier of suppliers) {
      await pool.query(
        `INSERT INTO suppliers (id, supplier_name, contact_person, phone, email, address, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [
          supplier.id,
          supplier.supplier_name,
          supplier.contact_person,
          supplier.phone,
          supplier.email,
          supplier.address,
        ]
      );
    }

    // 6. Create Assets
    console.log("📦 Creating assets...");
    const assets = [
      {
        id: uuidv4(),
        asset_name: "Patient Bed - Electric",
        asset_tag: "BED-001",
        serial_number: "SN-12345",
        category_id: categories[2].id,
        purchase_date: new Date("2022-01-15"),
        purchase_cost: 1500.00,
        supplier_id: suppliers[0].id,
        warranty_expiry: new Date("2025-01-15"),
        asset_condition: "good",
        status: "available",
        department_id: departments[0].id,
      },
      {
        id: uuidv4(),
        asset_name: "X-Ray Machine",
        asset_tag: "XR-001",
        serial_number: "SN-67890",
        category_id: categories[0].id,
        purchase_date: new Date("2021-06-20"),
        purchase_cost: 45000.00,
        supplier_id: suppliers[0].id,
        warranty_expiry: new Date("2024-06-20"),
        asset_condition: "good",
        status: "available",
        department_id: departments[1].id,
      },
      {
        id: uuidv4(),
        asset_name: "Desktop Computer",
        asset_tag: "CPU-001",
        serial_number: "SN-11111",
        category_id: categories[1].id,
        purchase_date: new Date("2023-03-10"),
        purchase_cost: 800.00,
        supplier_id: suppliers[1].id,
        warranty_expiry: new Date("2025-03-10"),
        asset_condition: "good",
        status: "available",
        department_id: departments[4].id,
      },
      {
        id: uuidv4(),
        asset_name: "Ambulance",
        asset_tag: "VEH-001",
        serial_number: "SN-22222",
        category_id: categories[3].id,
        purchase_date: new Date("2020-09-05"),
        purchase_cost: 35000.00,
        supplier_id: suppliers[2].id,
        warranty_expiry: new Date("2023-09-05"),
        asset_condition: "fair",
        status: "available",
        department_id: departments[0].id,
      },
      {
        id: uuidv4(),
        asset_name: "Laboratory Microscope",
        asset_tag: "LAB-001",
        serial_number: "SN-33333",
        category_id: categories[4].id,
        purchase_date: new Date("2022-11-20"),
        purchase_cost: 5000.00,
        supplier_id: suppliers[0].id,
        warranty_expiry: new Date("2025-11-20"),
        asset_condition: "good",
        status: "available",
        department_id: departments[2].id,
      },
    ];

    for (const asset of assets) {
      await pool.query(
        `INSERT INTO assets (id, asset_name, asset_tag, serial_number, category_id, purchase_date, purchase_cost, supplier_id, warranty_expiry, asset_condition, status, department_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
        [
          asset.id,
          asset.asset_name,
          asset.asset_tag,
          asset.serial_number,
          asset.category_id,
          asset.purchase_date,
          asset.purchase_cost,
          asset.supplier_id,
          asset.warranty_expiry,
          asset.asset_condition,
          asset.status,
          asset.department_id,
        ]
      );
    }

    // 7. Create Asset Assignments
    console.log("📌 Creating asset assignments...");
    await pool.query(
      `INSERT INTO asset_assignments (id, asset_id, assigned_to, department_id, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), assets[0].id, createdUsers[3].user_id, departments[0].id, "active"]
    );

    // 8. Create Maintenance Records
    console.log("🔧 Creating maintenance records...");
    await pool.query(
      `INSERT INTO maintenance_records (id, asset_id, maintenance_date, maintenance_type, description, cost, technician_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [
        uuidv4(),
        assets[1].id,
        new Date("2024-01-15"),
        "Preventive",
        "Regular maintenance check",
        500.0,
        createdUsers[2].user_id,
        "completed",
      ]
    );

    // 9. Create Fault Reports
    console.log("⚠️  Creating fault reports...");
    await pool.query(
      `INSERT INTO fault_reports (id, asset_id, description, priority, report_date, reported_by, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [
        uuidv4(),
        assets[3].id,
        "Engine making unusual noise",
        "medium",
        new Date("2024-02-01"),
        createdUsers[4].user_id,
        "pending",
      ]
    );

    // 10. Create Asset Movements
    console.log("↔️  Creating asset movements...");
    await pool.query(
      `INSERT INTO asset_movements (id, asset_id, from_department_id, to_department_id, movement_date, reason, moved_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        uuidv4(),
        assets[2].id,
        departments[4].id,
        departments[0].id,
        new Date("2024-02-05"),
        "Departmental transfer",
        createdUsers[1].user_id,
      ]
    );

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📊 Seeded Data Summary:");
    console.log(`   • Roles: ${roles.length}`);
    console.log(`   • Departments: ${departments.length}`);
    console.log(`   • Users: ${users.length}`);
    console.log(`   • Asset Categories: ${categories.length}`);
    console.log(`   • Suppliers: ${suppliers.length}`);
    console.log(`   • Assets: ${assets.length}`);
    console.log("\n🔐 Test Credentials:");
    console.log("   Admin: admin / admin123");
    console.log("   Manager: asset_manager / user123");
    console.log("   Technician: technician1 / user123");

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await pool.end();
    process.exit(1);
  }
};
// Run seed
seedDatabase();
