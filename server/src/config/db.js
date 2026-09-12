import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

export async function connectDb(uri) {
  if (!uri) throw new Error('connectDb called without a connection string');

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  return mongoose.connection;
}

export async function disconnectDb() {
  await mongoose.disconnect();
}

/**
 * Transactions require a replica set. A standalone mongod throws
 * IllegalOperation / "Transaction numbers are only allowed on a replica set
 * member or mongos". We check once at boot so the failure is a clear log line
 * instead of a 500 on the first booking.
 */
export async function assertTransactionSupport() {
  const admin = mongoose.connection.db.admin();
  try {
    const info = await admin.command({ hello: 1 });
    const isReplicaSet = Boolean(info.setName) || info.msg === 'isdbgrid';
    if (!isReplicaSet) {
      console.warn(
        '\nWARNING: this MongoDB deployment is a standalone server.\n' +
          'Bookings use multi-document transactions, which require a replica set.\n' +
          'Use MongoDB Atlas, or start mongod with --replSet rs0 and run rs.initiate().\n'
      );
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
