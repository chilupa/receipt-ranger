# Receipt Ranger

A Next.js application using the App Router that allows users to upload receipt images, extracts product names, prices, and store names using AWS Textract, stores them in a PostgreSQL database, and displays price comparison history with store information.

## Features

- **Receipt Upload**: Upload receipt images with progress bar feedback
- **Text Extraction**: Automatically extracts product names, prices, and store names using AWS Textract
- **Store Detection**: Intelligently identifies store names from receipt headers
- **Price History**: Search and compare prices across different stores and dates
- **Modern UI**: Clean, responsive design with inline styling
- **Database Storage**: Persistent storage in PostgreSQL with receipt tracking

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
   Create tables with:

   ```sql
   CREATE TABLE receipts (
     id SERIAL PRIMARY KEY,
     receipt_id VARCHAR(255) UNIQUE NOT NULL,
     store_name VARCHAR(255) DEFAULT 'Unknown Store',
     uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE prices (
     id SERIAL PRIMARY KEY,
     receipt_id INTEGER REFERENCES receipts(id),
     product VARCHAR(255) NOT NULL,
     price DECIMAL(10,2) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```

## Usage

1. **Upload Receipt**: Click "Select receipt image" and choose an image file
2. **Processing**: Watch the progress bar as the receipt is processed
3. **View Results**: Extracted products and prices are automatically saved
4. **Compare Prices**: Enter a product name to see price history across different stores
5. **Store Information**: Each price entry shows the store name and upload date

## Technical Details

- **Frontend**: Next.js 14 with App Router, React hooks for state management
- **Backend**: Next.js API routes for upload and data retrieval
- **Database**: PostgreSQL with relational design for receipts and prices
- **AWS Integration**: Textract for OCR with FORMS and TABLES feature types

## Notes

- Ensure AWS credentials have Textract permissions
- Store name extraction works with most receipt formats (all caps, title case)
- Price extraction expects "$XX.XX" format on separate lines
- Upload progress provides visual feedback during processing
- Time display excludes seconds for cleaner presentation
