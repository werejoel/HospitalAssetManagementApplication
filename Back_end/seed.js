const pool = require("./db_config");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const seedDatabase = async () => {
  try {
    console.log("Starting database seed...");

    // Clean existing data (in reverse foreign key dependency order)
    console.log("Clearing existing data...");
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
    console.log("Creating roles...");
    const roles = [
      { id: uuidv4(), role_name: "admin", description: "System Administrator" },
      {
        id: uuidv4(),
        role_name: "asset_manager",
        description: "Asset Manager",
      },
      { id: uuidv4(), role_name: "technician", description: "Technician" },
      {
        id: uuidv4(),
        role_name: "department_head",
        description: "Department Head",
      },
      { id: uuidv4(), role_name: "staff", description: "General Staff" },
    ];

    for (const role of roles) {
      await pool.query(
        `INSERT INTO roles (id, role_name, description, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())`,
        [role.id, role.role_name, role.description],
      );
    }

    const adminRoleId = roles[0].id;
    const assetManagerRoleId = roles[1].id;
    const technicianRoleId = roles[2].id;
    const departmentHeadRoleId = roles[3].id;
    const staffRoleId = roles[4].id;

    // 2. Create Departments
    console.log("Creating departments...");
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
      {
        id: uuidv4(),
        department_name: "Pediatrics",
        location: "Building B, Floor 2",
        head_of_department: "Dr. Amina Kato",
        contact: "+256-706-678-901",
      },
      {
        id: uuidv4(),
        department_name: "Pharmacy",
        location: "Building C, Floor 1",
        head_of_department: "Mr. Samuel Byaruhanga",
        contact: "+256-707-789-012",
      },
      {
        id: uuidv4(),
        department_name: "Emergency",
        location: "Building A, Ground Floor",
        head_of_department: "Dr. Esther Namusoke",
        contact: "+256-708-890-123",
      },
      {
        id: uuidv4(),
        department_name: "Nutrition",
        location: "Building D, Floor 1",
        head_of_department: "Ms. Anita Ocen",
        contact: "+256-709-901-234",
      },
      {
        id: uuidv4(),
        department_name: "Dental",
        location: "Building B, Floor 3",
        head_of_department: "Dr. Michael Luwaga",
        contact: "+256-710-012-345",
      },
    ];

    for (const dept of departments) {
      await pool.query(
        `INSERT INTO departments (id, department_name, location, head_of_department, contact, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [
          dept.id,
          dept.department_name,
          dept.location,
          dept.head_of_department,
          dept.contact,
        ],
      );
    }

    // 3. Create Users
    console.log("Creating users...");
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

      {
        user_id: uuidv4(),
        full_name: "Were Joel",
        username: "werejoel256",
        email: "joelwere992@gmail.com",
        password: userPassword,
        phone_number: "+256-705-672-545",
        role_id: "asset_manager",
        department_id: departments[0].id,
        status: "active",
      },

      {
        user_id: uuidv4(),
        full_name: "Zandya Ivan",
        username: "ivanzandya25",
        email: "ivanzandya25@gmail.com",
        password: userPassword,
        phone_number: "+256-751-715-710",
        role_id: "technician",
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
        ],
      );
      createdUsers.push(user);
    }

    // 4. Create user roles
    console.log("Creating user roles...");
    const userRoles = [
      { id: uuidv4(), user_id: createdUsers[0].user_id, role: "admin" },
      { id: uuidv4(), user_id: createdUsers[1].user_id, role: "asset_manager" },
      { id: uuidv4(), user_id: createdUsers[2].user_id, role: "technician" },
      { id: uuidv4(), user_id: createdUsers[3].user_id, role: "department_head" },
      { id: uuidv4(), user_id: createdUsers[4].user_id, role: "staff" },
      { id: uuidv4(), user_id: createdUsers[5].user_id, role: "asset_manager" },
      { id: uuidv4(), user_id: createdUsers[6].user_id, role: "technician" },
      { id: uuidv4(), user_id: createdUsers[0].user_id, role: "asset_manager" },
      { id: uuidv4(), user_id: createdUsers[1].user_id, role: "staff" },
      { id: uuidv4(), user_id: createdUsers[2].user_id, role: "staff" },
    ];

    for (const role of userRoles) {
      await pool.query(
        `INSERT INTO user_roles (id, user_id, role) VALUES ($1, $2, $3)`,
        [role.id, role.user_id, role.role],
      );
    }

    // 5. Create user profiles
    console.log("Creating user profiles...");
    const profiles = [
      { id: uuidv4(), user_id: createdUsers[0].user_id, full_name: "Admin User", phone_number: "+256-701-000-001", department_id: departments[4].id, status: "active" },
      { id: uuidv4(), user_id: createdUsers[1].user_id, full_name: "Asset Manager", phone_number: "+256-702-000-002", department_id: departments[4].id, status: "active" },
      { id: uuidv4(), user_id: createdUsers[2].user_id, full_name: "John Technician", phone_number: "+256-703-000-003", department_id: departments[0].id, status: "active" },
      { id: uuidv4(), user_id: createdUsers[3].user_id, full_name: "Dr. James Kali", phone_number: "+256-701-123-456", department_id: departments[0].id, status: "active" },
      { id: uuidv4(), user_id: createdUsers[4].user_id, full_name: "Nurse Mary", phone_number: "+256-704-000-005", department_id: departments[0].id, status: "active" },
      { id: uuidv4(), user_id: createdUsers[5].user_id, full_name: "Were Joel", phone_number: "+256-705-672-545", department_id: departments[0].id, status: "active" },
      { id: uuidv4(), user_id: createdUsers[6].user_id, full_name: "Zandya Ivan", phone_number: "+256-751-715-710", department_id: departments[0].id, status: "active" },
      { id: uuidv4(), user_id: createdUsers[0].user_id, full_name: "Admin User", phone_number: "+256-701-000-001", department_id: departments[4].id, status: "active" },
      { id: uuidv4(), user_id: createdUsers[1].user_id, full_name: "Asset Manager", phone_number: "+256-702-000-002", department_id: departments[4].id, status: "active" },
      { id: uuidv4(), user_id: createdUsers[2].user_id, full_name: "John Technician", phone_number: "+256-703-000-003", department_id: departments[0].id, status: "active" },
    ];

    for (const profile of profiles) {
      await pool.query(
        `INSERT INTO profiles (id, user_id, full_name, phone_number, department_id, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [profile.id, profile.user_id, profile.full_name, profile.phone_number, profile.department_id, profile.status],
      );
    }

    // 6. Create Asset Categories
    console.log("Creating asset categories...");
    const categories = [
      {
        id: uuidv4(),
        category_name: "Medical Equipment",
        description: "Medical and diagnostic equipment",
      },
      {
        id: uuidv4(),
        category_name: "Computer & IT",
        description: "Computers, servers, networking equipment",
      },
      {
        id: uuidv4(),
        category_name: "Furniture",
        description: "Beds, chairs, tables, cabinets",
      },
      {
        id: uuidv4(),
        category_name: "Vehicles",
        description: "Ambulances, vans, motorcycles",
      },
      {
        id: uuidv4(),
        category_name: "Laboratory Supplies",
        description: "Lab equipment and instruments",
      },
      {
        id: uuidv4(),
        category_name: "Consumables",
        description: "Disposable medical supplies and consumables",
      },
      {
        id: uuidv4(),
        category_name: "Security Equipment",
        description: "Access control and surveillance devices",
      },
      {
        id: uuidv4(),
        category_name: "Office Supplies",
        description: "Office furniture and stationery",
      },
      {
        id: uuidv4(),
        category_name: "Building Maintenance",
        description: "Tools and equipment for facilities upkeep",
      },
      {
        id: uuidv4(),
        category_name: "Medical Software",
        description: "Clinical and administrative software licenses",
      },
    ];

    for (const cat of categories) {
      await pool.query(
        `INSERT INTO asset_categories (id, category_name, description) VALUES ($1, $2, $3)`,
        [cat.id, cat.category_name, cat.description],
      );
    }

    // 5. Create Suppliers
    console.log("Creating suppliers...");
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
      {
        id: uuidv4(),
        supplier_name: "HealthTech Distributors",
        contact_person: "Ms. Linda Kintu",
        phone: "+256-704-555-004",
        email: "support@healthtech.ug",
        address: "Kampala Industrial Park, Kampala",
      },
      {
        id: uuidv4(),
        supplier_name: "Campus Office Systems",
        contact_person: "Mr. David Ssebajja",
        phone: "+256-705-555-005",
        email: "sales@campusoffice.ug",
        address: "Makerere Hill, Kampala",
      },
      {
        id: uuidv4(),
        supplier_name: "LabCare Equipment",
        contact_person: "Dr. Susan Nankunda",
        phone: "+256-706-555-006",
        email: "contact@labcare.ug",
        address: "Ntinda Commerce Park, Kampala",
      },
      {
        id: uuidv4(),
        supplier_name: "Secure Systems Ltd",
        contact_person: "Mr. Paul Byaruhanga",
        phone: "+256-707-555-007",
        email: "info@securesystems.ug",
        address: "Kira Road, Kampala",
      },
      {
        id: uuidv4(),
        supplier_name: "Facility Maintenance Co",
        contact_person: "Ms. Rachel Tumusiime",
        phone: "+256-708-555-008",
        email: "service@facmaint.ug",
        address: "Entebbe Road, Kampala",
      },
      {
        id: uuidv4(),
        supplier_name: "Pharma Direct Ltd",
        contact_person: "Mr. Isaac Owomugisha",
        phone: "+256-709-555-009",
        email: "orders@pharmadirect.ug",
        address: "Mukono Road, Kampala",
      },
      {
        id: uuidv4(),
        supplier_name: "IT Resellers Uganda",
        contact_person: "Ms. Esther Namagembe",
        phone: "+256-710-555-010",
        email: "sales@itresellers.ug",
        address: "Wampewo Avenue, Kampala",
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
        ],
      );
    }

    // 6. Create Assets
    console.log("Creating assets...");
    const assets = [
      {
        id: uuidv4(),
        asset_name: "Patient Bed - Electric",
        asset_tag: "BED-001",
        serial_number: "SN-12345",
        category_id: categories[2].id,
        purchase_date: new Date("2022-01-15"),
        purchase_cost: 1500.0,
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
        purchase_cost: 45000.0,
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
        purchase_cost: 800.0,
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
        purchase_cost: 35000.0,
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
        purchase_cost: 5000.0,
        supplier_id: suppliers[0].id,
        warranty_expiry: new Date("2025-11-20"),
        asset_condition: "good",
        status: "available",
        department_id: departments[2].id,
      },
      {
        id: uuidv4(),
        asset_name: "Surgical Lamp",
        asset_tag: "MED-002",
        serial_number: "SN-44444",
        category_id: categories[0].id,
        purchase_date: new Date("2023-02-01"),
        purchase_cost: 2200.0,
        supplier_id: suppliers[3].id,
        warranty_expiry: new Date("2026-02-01"),
        asset_condition: "good",
        status: "available",
        department_id: departments[3].id,
      },
      {
        id: uuidv4(),
        asset_name: "Network Switch",
        asset_tag: "NET-001",
        serial_number: "SN-55555",
        category_id: categories[1].id,
        purchase_date: new Date("2024-01-10"),
        purchase_cost: 1200.0,
        supplier_id: suppliers[9].id,
        warranty_expiry: new Date("2027-01-10"),
        asset_condition: "good",
        status: "available",
        department_id: departments[4].id,
      },
      {
        id: uuidv4(),
        asset_name: "Reception Desk",
        asset_tag: "FUR-001",
        serial_number: "SN-66666",
        category_id: categories[2].id,
        purchase_date: new Date("2021-08-15"),
        purchase_cost: 1800.0,
        supplier_id: suppliers[4].id,
        warranty_expiry: new Date("2024-08-15"),
        asset_condition: "good",
        status: "available",
        department_id: departments[4].id,
      },
      {
        id: uuidv4(),
        asset_name: "Wheelchair",
        asset_tag: "FUR-002",
        serial_number: "SN-77777",
        category_id: categories[2].id,
        purchase_date: new Date("2022-05-20"),
        purchase_cost: 400.0,
        supplier_id: suppliers[0].id,
        warranty_expiry: new Date("2026-05-20"),
        asset_condition: "good",
        status: "available",
        department_id: departments[0].id,
      },
      {
        id: uuidv4(),
        asset_name: "Blood Analyzer",
        asset_tag: "LAB-002",
        serial_number: "SN-88888",
        category_id: categories[4].id,
        purchase_date: new Date("2023-09-12"),
        purchase_cost: 9800.0,
        supplier_id: suppliers[5].id,
        warranty_expiry: new Date("2026-09-12"),
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
        ],
      );
    }

    // 7. Create Asset Assignments
    console.log("Creating asset assignments...");
    const assignments = [
      { id: uuidv4(), asset_id: assets[0].id, assigned_to: createdUsers[3].user_id, department_id: departments[0].id, status: "active" },
      { id: uuidv4(), asset_id: assets[1].id, assigned_to: createdUsers[2].user_id, department_id: departments[1].id, status: "active" },
      { id: uuidv4(), asset_id: assets[2].id, assigned_to: createdUsers[6].user_id, department_id: departments[4].id, status: "active" },
      { id: uuidv4(), asset_id: assets[3].id, assigned_to: createdUsers[4].user_id, department_id: departments[0].id, status: "active" },
      { id: uuidv4(), asset_id: assets[4].id, assigned_to: createdUsers[3].user_id, department_id: departments[2].id, status: "returned" },
      { id: uuidv4(), asset_id: assets[5].id, assigned_to: createdUsers[2].user_id, department_id: departments[3].id, status: "active" },
      { id: uuidv4(), asset_id: assets[6].id, assigned_to: createdUsers[1].user_id, department_id: departments[4].id, status: "active" },
      { id: uuidv4(), asset_id: assets[7].id, assigned_to: createdUsers[5].user_id, department_id: departments[4].id, status: "active" },
      { id: uuidv4(), asset_id: assets[8].id, assigned_to: createdUsers[0].user_id, department_id: departments[3].id, status: "returned" },
      { id: uuidv4(), asset_id: assets[9].id, assigned_to: createdUsers[6].user_id, department_id: departments[2].id, status: "active" },
    ];

    for (const assignment of assignments) {
      await pool.query(
        `INSERT INTO asset_assignments (id, asset_id, assigned_to, department_id, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [assignment.id, assignment.asset_id, assignment.assigned_to, assignment.department_id, assignment.status],
      );
    }

    // 8. Create Maintenance Records
    console.log("Creating maintenance records...");
    const maintenanceRecords = [
      {
        id: uuidv4(),
        asset_id: assets[1].id,
        maintenance_date: new Date("2024-01-15"),
        maintenance_type: "Preventive",
        description: "Regular maintenance check",
        cost: 500.0,
        technician_id: createdUsers[2].user_id,
        status: "completed",
      },
      {
        id: uuidv4(),
        asset_id: assets[0].id,
        maintenance_date: new Date("2024-03-10"),
        maintenance_type: "Repair",
        description: "Replaced damaged mattress module",
        cost: 250.0,
        technician_id: createdUsers[6].user_id,
        status: "completed",
      },
      {
        id: uuidv4(),
        asset_id: assets[2].id,
        maintenance_date: new Date("2024-04-01"),
        maintenance_type: "Preventive",
        description: "Software update and security audit",
        cost: 300.0,
        technician_id: createdUsers[2].user_id,
        status: "completed",
      },
      {
        id: uuidv4(),
        asset_id: assets[3].id,
        maintenance_date: new Date("2024-05-05"),
        maintenance_type: "Repair",
        description: "Engine diagnostics and calibration",
        cost: 800.0,
        technician_id: createdUsers[6].user_id,
        status: "scheduled",
      },
      {
        id: uuidv4(),
        asset_id: assets[4].id,
        maintenance_date: new Date("2024-06-15"),
        maintenance_type: "Calibration",
        description: "Microscope lens alignment",
        cost: 150.0,
        technician_id: createdUsers[2].user_id,
        status: "completed",
      },
      {
        id: uuidv4(),
        asset_id: assets[5].id,
        maintenance_date: new Date("2024-06-20"),
        maintenance_type: "Preventive",
        description: "Surgical lamp bulb and wiring check",
        cost: 120.0,
        technician_id: createdUsers[6].user_id,
        status: "in_progress",
      },
      {
        id: uuidv4(),
        asset_id: assets[6].id,
        maintenance_date: new Date("2024-07-01"),
        maintenance_type: "Network",
        description: "Switch firmware upgrade",
        cost: 220.0,
        technician_id: createdUsers[2].user_id,
        status: "completed",
      },
      {
        id: uuidv4(),
        asset_id: assets[7].id,
        maintenance_date: new Date("2024-07-12"),
        maintenance_type: "Repair",
        description: "Desk surface repair and polish",
        cost: 80.0,
        technician_id: createdUsers[6].user_id,
        status: "completed",
      },
      {
        id: uuidv4(),
        asset_id: assets[8].id,
        maintenance_date: new Date("2024-07-20"),
        maintenance_type: "Service",
        description: "Wheelchair tire replacement",
        cost: 60.0,
        technician_id: createdUsers[2].user_id,
        status: "completed",
      },
      {
        id: uuidv4(),
        asset_id: assets[9].id,
        maintenance_date: new Date("2024-08-01"),
        maintenance_type: "Calibration",
        description: "Blood analyzer sensor check",
        cost: 350.0,
        technician_id: createdUsers[6].user_id,
        status: "scheduled",
      },
    ];

    for (const record of maintenanceRecords) {
      await pool.query(
        `INSERT INTO maintenance_records (id, asset_id, maintenance_date, maintenance_type, description, cost, technician_id, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [
          record.id,
          record.asset_id,
          record.maintenance_date,
          record.maintenance_type,
          record.description,
          record.cost,
          record.technician_id,
          record.status,
        ],
      );
    }

    // 9. Create Fault Reports
    console.log("Creating fault reports...");
    const faultReports = [
      {
        id: uuidv4(),
        asset_id: assets[3].id,
        description: "Engine making unusual noise",
        priority: "medium",
        report_date: new Date("2024-02-01"),
        reported_by: createdUsers[4].user_id,
        assigned_to: createdUsers[6].user_id,
        status: "pending",
      },
      {
        id: uuidv4(),
        asset_id: assets[0].id,
        description: "Bed motor is unstable",
        priority: "high",
        report_date: new Date("2024-02-10"),
        reported_by: createdUsers[0].user_id,
        assigned_to: createdUsers[2].user_id,
        status: "in_progress",
        resolution_notes: "Replacement controller ordered.",
      },
      {
        id: uuidv4(),
        asset_id: assets[1].id,
        description: "X-ray display flickers intermittently",
        priority: "high",
        report_date: new Date("2024-03-05"),
        reported_by: createdUsers[1].user_id,
        assigned_to: createdUsers[6].user_id,
        status: "completed",
        resolution_notes: "Replaced faulty power supply.",
      },
      {
        id: uuidv4(),
        asset_id: assets[2].id,
        description: "Computer is running slowly",
        priority: "low",
        report_date: new Date("2024-03-12"),
        reported_by: createdUsers[5].user_id,
        assigned_to: createdUsers[6].user_id,
        status: "completed",
        resolution_notes: "Cleared temporary files and updated OS.",
      },
      {
        id: uuidv4(),
        asset_id: assets[4].id,
        description: "Microscope focus controls sticky",
        priority: "medium",
        report_date: new Date("2024-04-01"),
        reported_by: createdUsers[2].user_id,
        assigned_to: createdUsers[2].user_id,
        status: "pending",
      },
      {
        id: uuidv4(),
        asset_id: assets[5].id,
        description: "Surgical lamp head is loose",
        priority: "low",
        report_date: new Date("2024-04-15"),
        reported_by: createdUsers[3].user_id,
        assigned_to: createdUsers[6].user_id,
        status: "completed",
        resolution_notes: "Bolted assembly and adjusted mount.",
      },
      {
        id: uuidv4(),
        asset_id: assets[6].id,
        description: "Network switch is overheating",
        priority: "medium",
        report_date: new Date("2024-05-05"),
        reported_by: createdUsers[4].user_id,
        assigned_to: createdUsers[2].user_id,
        status: "in_progress",
      },
      {
        id: uuidv4(),
        asset_id: assets[7].id,
        description: "Desk drawer does not latch",
        priority: "low",
        report_date: new Date("2024-05-25"),
        reported_by: createdUsers[0].user_id,
        assigned_to: createdUsers[6].user_id,
        status: "completed",
        resolution_notes: "Replaced latch hardware.",
      },
      {
        id: uuidv4(),
        asset_id: assets[8].id,
        description: "Wheelchair brakes squeak",
        priority: "low",
        report_date: new Date("2024-06-10"),
        reported_by: createdUsers[5].user_id,
        assigned_to: createdUsers[2].user_id,
        status: "completed",
      },
      {
        id: uuidv4(),
        asset_id: assets[9].id,
        description: "Blood analyzer error code during test run",
        priority: "high",
        report_date: new Date("2024-06-20"),
        reported_by: createdUsers[1].user_id,
        assigned_to: createdUsers[6].user_id,
        status: "pending",
      },
    ];

    for (const report of faultReports) {
      await pool.query(
        `INSERT INTO fault_reports (id, asset_id, description, priority, report_date, reported_by, assigned_to, status, resolution_notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          report.id,
          report.asset_id,
          report.description,
          report.priority,
          report.report_date,
          report.reported_by,
          report.assigned_to,
          report.status,
          report.resolution_notes || null,
        ],
      );
    }

    // 10. Create Asset Movements
    console.log("Creating asset movements...");
    const movements = [
      {
        id: uuidv4(),
        asset_id: assets[2].id,
        from_department_id: departments[4].id,
        to_department_id: departments[0].id,
        movement_date: new Date("2024-02-05"),
        reason: "Departmental transfer",
        moved_by: createdUsers[1].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[0].id,
        from_department_id: departments[0].id,
        to_department_id: departments[3].id,
        movement_date: new Date("2024-03-02"),
        reason: "Temporary surgery support",
        moved_by: createdUsers[0].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[1].id,
        from_department_id: departments[1].id,
        to_department_id: departments[2].id,
        movement_date: new Date("2024-03-10"),
        reason: "Calibration service",
        moved_by: createdUsers[2].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[3].id,
        from_department_id: departments[0].id,
        to_department_id: departments[4].id,
        movement_date: new Date("2024-04-01"),
        reason: "Research support",
        moved_by: createdUsers[1].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[4].id,
        from_department_id: departments[2].id,
        to_department_id: departments[1].id,
        movement_date: new Date("2024-04-12"),
        reason: "Inspection",
        moved_by: createdUsers[3].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[5].id,
        from_department_id: departments[3].id,
        to_department_id: departments[0].id,
        movement_date: new Date("2024-05-06"),
        reason: "Emergency backup",
        moved_by: createdUsers[0].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[6].id,
        from_department_id: departments[4].id,
        to_department_id: departments[3].id,
        movement_date: new Date("2024-05-20"),
        reason: "Network upgrade",
        moved_by: createdUsers[5].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[7].id,
        from_department_id: departments[4].id,
        to_department_id: departments[4].id,
        movement_date: new Date("2024-06-02"),
        reason: "Reorganization",
        moved_by: createdUsers[5].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[8].id,
        from_department_id: departments[0].id,
        to_department_id: departments[3].id,
        movement_date: new Date("2024-06-18"),
        reason: "Patient transport",
        moved_by: createdUsers[2].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[9].id,
        from_department_id: departments[2].id,
        to_department_id: departments[1].id,
        movement_date: new Date("2024-07-01"),
        reason: "Testing support",
        moved_by: createdUsers[6].user_id,
      },
    ];

    for (const movement of movements) {
      await pool.query(
        `INSERT INTO asset_movements (id, asset_id, from_department_id, to_department_id, movement_date, reason, moved_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          movement.id,
          movement.asset_id,
          movement.from_department_id,
          movement.to_department_id,
          movement.movement_date,
          movement.reason,
          movement.moved_by,
        ],
      );
    }

    // 11. Create Asset Disposals
    console.log("Creating asset disposals...");
    const disposals = [
      {
        id: uuidv4(),
        asset_id: assets[9].id,
        disposal_date: new Date("2024-07-20"),
        disposal_method: "Recycle",
        reason: "End of Life",
        approved_by: createdUsers[0].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[8].id,
        disposal_date: new Date("2024-07-15"),
        disposal_method: "Donation",
        reason: "Obsolete",
        approved_by: createdUsers[1].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[7].id,
        disposal_date: new Date("2024-06-30"),
        disposal_method: "Auction",
        reason: "Damage Beyond Repair",
        approved_by: createdUsers[0].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[6].id,
        disposal_date: new Date("2024-06-20"),
        disposal_method: "Recycle",
        reason: "Obsolete",
        approved_by: createdUsers[1].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[5].id,
        disposal_date: new Date("2024-06-10"),
        disposal_method: "Donation",
        reason: "End of Life",
        approved_by: createdUsers[0].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[4].id,
        disposal_date: new Date("2024-05-22"),
        disposal_method: "Auction",
        reason: "Obsolete",
        approved_by: createdUsers[1].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[3].id,
        disposal_date: new Date("2024-05-12"),
        disposal_method: "Recycle",
        reason: "Damage Beyond Repair",
        approved_by: createdUsers[0].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[2].id,
        disposal_date: new Date("2024-05-01"),
        disposal_method: "Donation",
        reason: "Stolen",
        approved_by: createdUsers[1].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[1].id,
        disposal_date: new Date("2024-04-20"),
        disposal_method: "Auction",
        reason: "Obsolete",
        approved_by: createdUsers[0].user_id,
      },
      {
        id: uuidv4(),
        asset_id: assets[0].id,
        disposal_date: new Date("2024-04-10"),
        disposal_method: "Recycle",
        reason: "End of Life",
        approved_by: createdUsers[1].user_id,
      },
    ];

    for (const disposal of disposals) {
      await pool.query(
        `INSERT INTO asset_disposals (id, asset_id, disposal_date, disposal_method, reason, approved_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [
          disposal.id,
          disposal.asset_id,
          disposal.disposal_date,
          disposal.disposal_method,
          disposal.reason,
          disposal.approved_by,
        ],
      );
    }

    console.log(" Database seeding completed successfully!");
    console.log("\n Seeded Data Summary:");
    console.log(`   • Roles: ${roles.length}`);
    console.log(`   • Departments: ${departments.length}`);
    console.log(`   • Users: ${users.length}`);
    console.log(`   • Asset Categories: ${categories.length}`);
    console.log(`   • Suppliers: ${suppliers.length}`);
    console.log(`   • Assets: ${assets.length}`);
    console.log("\n Test Credentials:");
    console.log("   Admin: admin / admin123");
    console.log("   Manager: asset_manager / user123");
    console.log("   Technician: technician1 / user123");

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    await pool.end();
    process.exit(1);
  }
};
// Run seed
seedDatabase();
