import service from './service.js';
import path from 'path';
import fs from 'fs';

export const renderModernInvitation = async (req, res) => {
  try {
    const slug = req.query.slug;
    // Hardcoded dummy data for now, as requested.
    // In the future, this could be fetched from a database using the slug.
    let dummyData = path.resolve('src/public/data.json');
    const data = JSON.parse(fs.readFileSync(dummyData, 'utf-8'));

    console.log('dummy data', data);

    data.slug = slug;

    // res.render(`invitation/views/${slug}.ejs`, { data: dataUndangan });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
