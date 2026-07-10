let tables = [];
let tableIdCounter = 1;

const Table = {
  create({ tableNumber, capacity }) {
    const existingTable = tables.find(t => t.tableNumber === tableNumber && t.isActive);
    if (existingTable) {
      throw new Error('Table with this number already exists');
    }
    const table = {
      _id: tableIdCounter++,
      tableNumber,
      capacity,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    tables.push(table);
    return table;
  },
  
  find({ isActive } = {}) {
    if (typeof isActive === 'boolean') {
      return tables.filter(t => t.isActive === isActive);
    }
    return [...tables];
  },
  
  findById(id) {
    return tables.find(t => t._id == id) || null;
  },
  
  findByIdAndUpdate(id, updates) {
    const index = tables.findIndex(t => t._id == id);
    if (index === -1) return null;
    
    // Check for table number conflict if updating tableNumber
    if (updates.tableNumber) {
      const conflict = tables.find(t => 
        t._id != id && 
        t.tableNumber === updates.tableNumber && 
        t.isActive
      );
      if (conflict) {
        throw new Error('Table with this number already exists');
      }
    }
    
    tables[index] = { ...tables[index], ...updates, updatedAt: new Date() };
    return tables[index];
  },
  
  findByIdAndDelete(id) {
    const index = tables.findIndex(t => t._id == id);
    if (index === -1) return null;
    const [deletedTable] = tables.splice(index, 1);
    return deletedTable;
  }
};

module.exports = Table;
