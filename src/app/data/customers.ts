import { Customer } from '../models/customer.model';

/* Seed data standing in for a customers backend/API */
export const SEED_CUSTOMERS: Customer[] = [
  { id: 'cus_1001', name: 'Ana Reyes',      email: 'ana.reyes@example.com',      phone: '(555) 201-3345', joinedAt: '2026-04-02', ordersCount: 6,  totalSpent: 0, status: 'active' },
  { id: 'cus_1002', name: 'Marco DeLuca',    email: 'marco.deluca@example.com',   phone: '(555) 118-9042', joinedAt: '2026-05-14', ordersCount: 3,  totalSpent: 0, status: 'active' },
  { id: 'cus_1003', name: 'Priya Shah',      email: 'priya.shah@example.com',     phone: '(555) 774-2201', joinedAt: '2026-01-27', ordersCount: 11, totalSpent: 0, status: 'active' },
  { id: 'cus_1004', name: 'Jamie Lee',       email: 'jamie.lee@example.com',      phone: '(555) 330-8871', joinedAt: '2026-06-09', ordersCount: 1,  totalSpent: 0, status: 'active' },
  { id: 'cus_1005', name: 'Devon Carter',    email: 'devon.carter@example.com',   phone: '(555) 902-1187', joinedAt: '2025-11-30', ordersCount: 8,  totalSpent: 0, status: 'active' },
  { id: 'cus_1006', name: 'Sofia Nakamura',  email: 'sofia.nakamura@example.com', phone: '(555) 445-6620', joinedAt: '2026-03-18', ordersCount: 4,  totalSpent: 0, status: 'active' },
  { id: 'cus_1007', name: 'Tomás Herrera',   email: 'tomas.herrera@example.com',  phone: '(555) 667-0093', joinedAt: '2026-07-22', ordersCount: 2,  totalSpent: 0, status: 'active' },
];

export async function generateCustomerId(): Promise<string> {
  const currentYear = new Date().getFullYear().toString().slice(-2); // "26"
  const counterRef = doc(db, 'counters', 'customers');
  return await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    let nextCount = 1;
    if (counterDoc.exists()) {
      const data = counterDoc.data();
      // If within same year, increment; if year changed, reset back to 1
      if (data.year === currentYear) {
        nextCount = (data.lastCount || 0) + 1;
      }
    } else {
      // If starting fresh after the seed data (7 customers), start at 8:
      nextCount = SEED_CUSTOMERS.length + 1;
    }
    // Format sequence: 1 -> "01", 8 -> "08", 10 -> "10"
    const formattedSequence = String(nextCount).padStart(2, '0');
    
    // Choose either '2601' or 'cus_2601':
    const customerId = `${currentYear}${formattedSequence}`; 
    // If you prefer the cus_ prefix: const customerId = `cus_${currentYear}${formattedSequence}`;
    // Update the counter in Firestore
    transaction.set(counterRef, {
      year: currentYear,
      lastCount: nextCount,
      updatedAt: new Date()
    });
    return customerId;
  });
}
/* 3. Function to save a new customer to Firestore with the generated ID */
export async function addCustomerToFirestore(
  customerData: Omit<Customer, 'id'>
): Promise<Customer> {
  // Generate the unique 26xx ID
  const newId = await generateCustomerId();
  const newCustomer: Customer = {
    ...customerData,
    id: newId
  } as Customer;
  // Save into the 'customers' collection with the custom ID
  await setDoc(doc(db, 'customers', newId), newCustomer);
  return newCustomer;
}
