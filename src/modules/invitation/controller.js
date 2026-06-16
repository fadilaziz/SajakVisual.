import service from './service.js';
import path from 'path';
import fs from 'fs';

//render invitation
export const renderTemplate = async (req, res) => {
  try {
    const slug = req.query.slug;

    return res.render(`invitation/views/${slug}.ejs`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

//get data invitation
export const getDataInvitation = async (req, res) => {
  try {
    const slug = req.query.slug;

    //Read data invitation from JSON file
    let dummyData = path.resolve('src/public/data.json');
    const data = JSON.parse(fs.readFileSync(dummyData, 'utf-8'));

    //Put slug into data invitation
    data.slug = slug;

    //Return data invitation
    return res.status(200).json({
      success: true,
      data: data,
      message: 'Invitation data retrieved successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
