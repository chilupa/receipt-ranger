# Product Price Comparison (App Router)

A Next.js application using the App Router that allows users to upload receipt images, extracts product names and prices using AWS Textract, stores them in a PostgreSQL database, and displays a price comparison chart.

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with:

   ```
   AWS_REGION=your-region
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   DB_USER=your-db-user
   DB_HOST=your-db-host
   DB_NAME=your-db-name
   DB_PASSWORD=your-db-password
   DB_PORT=your-db-port
   ```

3. **Set up PostgreSQL**:
   Create a table with:

   ```sql
   CREATE TABLE prices (
     id SERIAL PRIMARY KEY,
     product VARCHAR(255) NOT NULL,
     price DECIMAL(10,2) NOT NULL,
     created_at TIMESTAMP NOT NULL
   );
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```

## Usage

- Upload a receipt image containing product names and prices.
- The app will extract the data and display a bar chart comparing prices.
- The data is stored in the PostgreSQL database for persistence.

## Notes

- Ensure AWS credentials have Textract permissions.
- Receipt text extraction assumes a simple format (e.g., "Item $price"). Adjust the parsing logic in `lib/aws.js` for specific receipt formats.
- Minimal styling is used as requested. Add CSS or a styling framework for enhanced UI.
