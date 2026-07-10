let reservations = [];
let reservationIdCounter = 1;

const Reservation = {
  create({ customer, table, date, timeSlot, numberOfGuests }) {
    // Check for conflicts
    const conflict = reservations.find(r => 
      r.table == table && 
      r.date === date && 
      r.timeSlot === timeSlot && 
      r.status === 'confirmed'
    );
    if (conflict) {
      throw new Error('Table is already reserved for this date and time');
    }
    
    const reservation = {
      _id: reservationIdCounter++,
      customer,
      table,
      date,
      timeSlot,
      numberOfGuests,
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    reservations.push(reservation);
    return reservation;
  },
  
  find(filter = {}) {
    let result = [...reservations];
    if (filter.customer) {
      result = result.filter(r => r.customer == filter.customer);
    }
    if (filter.date) {
      result = result.filter(r => r.date === filter.date);
    }
    return result;
  },
  
  findById(id) {
    return reservations.find(r => r._id == id) || null;
  },
  
  findByIdAndUpdate(id, updates) {
    const index = reservations.findIndex(r => r._id == id);
    if (index === -1) return null;
    
    // Check for conflicts if updating table/date/timeSlot
    if (updates.table || updates.date || updates.timeSlot) {
      const updatedTable = updates.table || reservations[index].table;
      const updatedDate = updates.date || reservations[index].date;
      const updatedTimeSlot = updates.timeSlot || reservations[index].timeSlot;
      
      const conflict = reservations.find(r => 
        r._id != id && 
        r.table == updatedTable && 
        r.date === updatedDate && 
        r.timeSlot === updatedTimeSlot && 
        r.status === 'confirmed'
      );
      if (conflict) {
        throw new Error('Table is already reserved for this date and time');
      }
    }
    
    reservations[index] = { ...reservations[index], ...updates, updatedAt: new Date() };
    return reservations[index];
  }
};

module.exports = Reservation;
