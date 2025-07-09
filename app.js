const express = require('express');
const app= express();
require('./model/index');
require('./model/indexsql');
const Item = require('./model/item');
const Order=require('./model/order');
const Owner=require('./model/ownerOutlets');
const Ownersql=require('./model/Owner');
const Managersql=require('./model/Manager');
const Employeesql=require('./model/Employee');
const Outlet=require('./model/outlet');
const orderOfOutlet = require('./model/orderofOutlet');
const RawMaterial = require('./model/rawmaterial');
const Menu = require('./model/menu');
const Inventory = require('./model/inventory');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Sequelize =require('sequelize');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key';

app.use(bodyParser.json());

Managersql.sync();
Ownersql.sync();
Employeesql.sync();

// below function is used for token verifycation
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token is invalid' });
    }
    req.user = decoded;
    next();
  });
}


// below api is used to log in of owners

app.get('/login',async (req, res) => {
  const  emailId = req.body.emailId;
  const  password = req.body.password;
  const  level = req.body.level;

  if ((!emailId )|| (!password)||(!level)){
    return res.status(401).json({ message: 'email,password and level all are required' });
  }
  try{
  if(level=="Owner"){

  const ownerData= await Ownersql.findByPk(emailId);
  if(ownerData===null||ownerData.dataValues===null){
    return res.send({"message":"There is no user with such emailId"});
  }
  const userData =ownerData.dataValues;
  const Owner_id=userData.Owner_id;
  const expiresIn =3600;
  if (userData.password === password) {
    const token = jwt.sign({level,Owner_id}, secretKey, { expiresIn });
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid credentials' });


}else if(level=="manager"){


  const managerData= await Managersql.findByPk(emailId);
  if(managerData===null||managerData.dataValues===null){
    return res.send({"message":"There is no user with such emailId"});
  }
  const userData =managerData.dataValues;
  const Manager_id=userData.Manager_id;
  const expiresIn =3600;
  if (userData.password === password) {
    const token = jwt.sign({level,Manager_id}, secretKey, { expiresIn });
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
}else if(level=="employee"){
  

  const employeeData= await Employeesql.findByPk(emailId);
  if(employeeData===null||employeeData.dataValues===null){
    return res.send({"message":"There is no user with such emailId"});
  }
  const userData =employeeData.dataValues;
  const Employee_id=userData.Employee_id;
  const expiresIn =3600;
  if (userData.password === password) {
    const token = jwt.sign({level,Employee_id}, secretKey, { expiresIn });
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
}else{
  return res.send(`There is no role like ${level}`);
}
  }catch(error){
    res.send(error);
  }
});


// This should be done by company
app.post('/create-outlet', verifyToken , async (req, res) => {
  // return res.send(req.user);
    if(req.user.level!="Owner"){
      return res.send("You are not authorised bro");
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    console.log(req.user);
    try {
        const newMenu = new Menu({
          newMenu:[]
        });
        const newPending = new orderOfOutlet({
          orders_ids:[]
        });
        const newServed = new orderOfOutlet({
          orders_ids:[]
        });
        const newTodayServed = new orderOfOutlet({
          orders_ids:[]
        });
        const newInventory = new Inventory({
          Inventory:[]
        });
        const savedMenu = await newMenu.save();
        const savedPending = await newPending.save();
        const savedServed = await newServed.save();
        const savedTodayServed = await newTodayServed.save();
        const savedInventory = await newInventory.save();
        const newOutlet = new Outlet({
            Owner_id : req.user.Owner_id,
            Menu_id : savedMenu._id,
            Pending_list : savedPending._id,
            served_list : savedServed._id,
            Todayserved_list : savedTodayServed._id,
            inventory_id : savedInventory._id,
        });
        const savedOutlet = await newOutlet.save();
        const _id = req.user.Owner_id;
        const updatedOwner = await Owner.findByIdAndUpdate(_id,
            { $push: { Oulets_Ids: savedOutlet._id } },
            { new: true }
            );
        // console.log(newOutlet);
        console.log(_id);
        await session.commitTransaction();
        session.endSession();

        res.json({
            message: 'Outlet created and Owner updated successfully',
            newOutlet,
            updatedOwner
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error creating outlet and updating owner:', error);
        session.endSession();
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/newowner' , verifyToken ,async(req,res)=>{
  if(req.user.level!="employee"){
    return res.send("Bhosdk kon hai tu ? ");
  }
    console.log(req.body);
    const emailId=req.body.emailId;
    const password=req.body.password;
    const name=req.body.name;
    const contactnumber=req.body.contactnumber;
    try{
    const userWithSameEmailId= await Ownersql.findByPk(emailId);
    if(userWithSameEmailId){
      return res.json({"error":"email id already in use"});
    }
    const newOwner = new Owner();
    const genOwner =await newOwner.save();
    const ss=String(genOwner._id);
    const newUser = await Ownersql.create({
      Owner_id :ss,
      emailId,
      password,
      name,
      contactnumber
  });
    console.log(newUser);
    res.send(genOwner);
    }catch(error){
        res.send(error);
    }
});

app.get('/myoutlets',verifyToken,async(req,res)=>{
  if(req.user.level!="Owner"){
    return res.send("You are not authorised");
  }
  try{
  const Owner_id=req.user.Owner_id;
  // const Owner_id= await Ownersql.findByPk(emailId,{attributes:['Owner_id']});
  const outlets =await Owner.findById(Owner_id);
  res.send(outlets);
}catch(error){
  res.send(error);
}
});
app.get('/mymanagers',verifyToken,async(req,res)=>{
  if(req.user.level!="Owner"){
    return res.send("You are not authorised");
  }
  try{
  const Owner_id=req.user.Owner_id;
  // const Owner_id= await Ownersql.findByPk(emailId,{attributes:['Owner_id']});
  const outlets =await Owner.findById(Owner_id, 'Manager_Ids');
  res.send(outlets.Manager_Ids);
}catch(error){
  res.send(error);
}
});
app.post('/addmanager',verifyToken , async(req,res)=>{
  if(req.user.level!="Owner"){
    return res.send("You are not authorised");
  }
  const Manager_idalreadyinuse = await Managersql.findByPk(req.body.Manager_id);
  if(Manager_idalreadyinuse){
    return res.send("emailId already in use");
  }
  // res.send(req.body);
  const Manager_id = req.body.Manager_id;
  const password = req.body.password;
  const name = req.body.name;
  const contactnumber = req.body.contactnumber;
  const workingAt = req.body.workingAt;
  const newManager = await Managersql.create({
    Manager_id,
    password,
    name,
    contactnumber,
    workingAt
  }
  );
  const updatedownerOutlets =await Owner.findByIdAndUpdate(req.user.Owner_id,
    { $push: { Manager_Ids: newManager.Manager_id } },
    { new: true }
    );
    
    res.send("Manager added Successfully");
});
//put all served orders in a seprate collection
// app.post('/ordercompleted',async(req,res)=>{
//     try {
//         console.log(req.body);
//         const newOrder = new Order(req.body);
//         const savedOrder = await newOrder.save();
//         console.log('Order complted');
//       } catch (error) {
//         console.error('Error creating and saving Order document:', error);
//       }
//       return res.send("Saved");
// });


// below apis are relate to menu of a outlet


//handle menu of a particular outlet
app.put('/outlets/menu/:outletId/:itemId', verifyToken,async(req, res) => {
    const itemId = req.params.itemId;
    const outletId = req.params.outletId;
    if(req.user.level!="Owner"){
      return res.send("You are not authorised");
    }
    try{
    const menuItems= req.body.Menu;
      const outlet = await Outlet.findById(outletId);
      if (!outlet) {
        return res.status(404).json({ error: 'Outlet not found' });
      }
      if(outlet.Owner_id!=req.user.Owner_id){
        return res.status(404).json({ error: 'You are not authoried to access this outlet'});
      }
      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ error: 'item not found' });
      }
      item.Name = req.body.item.Name;
      item.Description = req.body.item.Description;
      item.Price = req.body.item.Price;
      item.requirements = req.body.item.requirements;
      console.log(item);
      const updatedItem = await item.save();
      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating menu:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

//create a new item in menu of a particular outlet

// use session ghanshyam
app.post('/outlets/menu/:outletId',verifyToken, async(req, res) => {
  const outletId = req.params.outletId;
  if(req.user.level!="Owner"){
    return res.send("You are not authorised");
  }
  try{
    const session = await mongoose.startSession();
    session.startTransaction();
    const outlet = await Outlet.findById(outletId,'Menu_id Owner_id');
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    if(outlet.Owner_id!=req.user.Owner_id){
      return res.status(404).json({ error: 'You are not authoried to access this outlet'});
    }
    const items = req.body.items;
    let i=0;
    for(i=0;i<items.length;i++){
      const newItem =new Item(items[i]);
      const savedItem =await newItem.save();
      await Menu.findByIdAndUpdate(
        outlet.Menu_id,
        { $push: { Menu: savedItem._id } },
      { new: true }
     );
    }
    session.commitTransaction();
    session.endSession();
    res.send("outlet menu updated");
  } catch (error) {
    console.error('Error updating menu:', error);
    session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//get menu of a particular outlet
// No authentication
app.get('/outlets/menu/:outletId', async(req, res) => {
    const outletId = req.params.outletId;
    try{
      const outletMenu = await Outlet.findById(outletId ,'Menu_id');
      if (!outletMenu) {
        return res.status(404).json({ error: 'Outlet not found' });
      }
      const MenuofOutlet =await Menu.findById(outletMenu.Menu_id).populate('Menu');
      console.log(MenuofOutlet);
      res.json(MenuofOutlet);
    } catch (error) {
      console.error('Error in getting menu:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

//set unavailablity

// for manager and owner both
app.put('/outlets/set/:outletId/:itemId',verifyToken, async(req, res) => {
  const itemId = req.params.itemId;
  const outletId = req.params.outletId;
  const set =req.body.set;
  try{
    if(req.user.level!="Owner"||req.user.level!="manager"){
      return res.send("You are not authorised to set availablity");
    }
  const outlet = await Outlet.findById(outletId);
  if((req.user.level=="Owner")&&(outlet.Owner_id!=req.user.Owner_id)){
    return res.status(404).json({ error: 'You are not authoried to access this outlet'});
  }else if((req.user.level=="manager")){
    const manager =await Managersql.findByPk(req.user.Manager_id,{attributes:['workingAt']});
    if(manager.dataValues.workingAt!=outletId){

    return res.status(404).json({ error: 'You are not authoried to access this outlet'});
  }
}
  const item = await Item.findById(itemId);
  if (!outlet) {
    return res.status(404).json({ error: 'Outlet not found' });
  }
  if (!item) {
    return res.status(404).json({ error: 'item not found' });
  }
  if(item.Available==0&&set==0){
    res.send("already set unavailable");
  }else if(item.Available==0&&set==1){
    item.Available=1;
    item.NotAvailableSince=null;
    const updatedItem = await item.save();
    res.send("Item is set to available");
  }else if(item.Available==1&&set==0){
    item.Available=0;
    item.NotAvailableSince=Date.now();
    const updatedItem = await item.save();
    res.send("Item is set to unavailable");
  }else{
    res.send("already set available");
  }
  } catch (error) {
  console.error('Error updating menu:', error);
  res.status(500).json({ error: 'Internal Server Error' });
  }
});


//placeorder as a customer
//no authentication
app.post('/outlets/placeorder/:outletId', async (req, res) => {
  const outletId = req.params.outletId;
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const outlet = await Outlet.findById(outletId,'Pending_list');
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    const newOrder = new Order( req.body.Order);
    const savedOrder =await newOrder.save();
    await orderOfOutlet.findByIdAndUpdate(
      outlet.Pending_list,
      { $push: { orders_ids: savedOrder._id } },
      { new: true }
    )
    session.commitTransaction();
    session.endSession()
    res.json(newOrder);
  } catch (error) {
    console.error('Error pushing object into array:', error);
    session.abortTransaction();
    session.endSession()
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//api to watch pending orders
//use by manager and owner both
app.get('/outlet/pendingorderlist/:outletId', verifyToken ,async(req,res)=>{
  const outletId=req.params.outletId;
  try{
    if(req.user.level!="Owner"||req.user.level!="manager"){
      return res.send("You are not authorised to set availablity");
    }
    const outlet = await Outlet.findById(outletId ,'Pending_list Owner_id');
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    if((req.user.level=="Owner")&&(outlet.Owner_id!=req.user.Owner_id)){
      return res.status(404).json({ error: 'You are not authoried to access this outlet'});
    }else if((req.user.level=="manager")){
      const manager =await Managersql.findByPk(req.user.Manager_id,{attributes:['workingAt']});
      if(manager.dataValues.workingAt!=outletId){
  
      return res.status(404).json({ error: 'You are not authoried to access this outlet'});
    }
  }
    const pendingorderlist =await orderOfOutlet.findById(outlet.Pending_list).populate('orders_ids');
    console.log(pendingorderlist);
    res.json(pendingorderlist);
  } catch (error) {
    console.error('Error in getting menu:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//serve an order
//use by manager and owner both
app.post('/outlet/serveorder/:outletId/order',verifyToken ,async(req,res)=>{
  const outletId =req.params.outletId;
  const orderId =req.body.orderId;
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    if(req.user.level!="Owner"||req.user.level!="manager"){
      return res.send("You are not authorised to set availablity");
    }
  const outlet =await Outlet.findById(outletId,'Pending_list Todayserved_list Owner_id');
    if (!outlet){
      return res.status(404).json({ error: 'Outlet not found' });
    }
    if((req.user.level=="Owner")&&(outlet.Owner_id!=req.user.Owner_id)){
      return res.status(404).json({ error: 'You are not authoried to access this outlet'});
    }else if((req.user.level=="manager")){
      const manager =await Managersql.findByPk(req.user.Manager_id,{attributes:['workingAt']});
      if(manager.dataValues.workingAt!=outletId){
  
      return res.status(404).json({ error: 'You are not authoried to access this outlet'});
    }
  }
  const pendinglist =await orderOfOutlet.findByIdAndUpdate(
    outlet.Pending_list,
    { $pull: { 'orders_ids': orderId } },
    { new: true }
  );
  const Todayservedlist =await orderOfOutlet.findByIdAndUpdate(
    outlet.Todayserved_list,
    {$push: {orders_ids: orderId }}
  )
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {$set :{
      'ServingTime': Date.now()
  }}
  )
  session.commitTransaction();
  session.endSession();
  res.send("pendinglisttoupdate");
}catch (error) {
  console.error('Error pushing object into array:', error);
  session.abortTransaction();
  session.endSession();
  res.status(500).json({ error: 'Internal Server Error' });
}
});

//below apis maintain inventory
app.get('/outlet/inventory/:outletId',verifyToken,async (req,res)=>{
  const outletId=req.params.outletId;
  try{
    if(req.user.level!="Owner"){
      return res.send("You are not authorised");
    }
    const outlet = await Outlet.findById(outletId ,'inventory_id Owner_id');
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    if(outlet.Owner_id!=req.user.Owner_id){
      return res.status(404).json({ error: 'You are not authoried to access this outlet'});
    }
    const todayInventory =await Inventory.findById(outlet.inventory_id).populate("Inventory");
    console.log(todayInventory);
    res.json(todayInventory);
  } catch (error) {
    console.error('Error in getting menu:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// add newitem in inventory
// use by owner
app.post('/outlet/addnewitemtoinventory/:outletId',verifyToken ,async(req,res)=>{
  const outletId=req.params.outletId;
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    if(req.user.level!="Owner"){
      return res.send("You are not authorised");
    }
    const outlet = await Outlet.findById(outletId ,'inventory_id Owner_id');
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    if(outlet.Owner_id!=req.user.Owner_id){
      return res.status(404).json({ error: 'You are not authoried to access this outlet'});
    }
    let i =0;
    let raw =req.body.rawMaterial;
    for(i=0;i<raw.length;i++){
    const newRawMaterial= new RawMaterial(raw[i]);
    const savedRawMaterial =await newRawMaterial.save();
    const inventory = await Inventory.findByIdAndUpdate(outlet.inventory_id,
    {$push: {Inventory: savedRawMaterial._id }}
    );
    }
    console.log(outlet.inventory_id);
  session.commitTransaction();
  session.endSession();
    res.send("inventory");
  } catch (error) {
    console.error('Error in getting menu:', error);
    session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//use by owner to add items
app.put('/outlet/updateinventory/:outletId/:rawMaterialId', verifyToken, async(req,res)=>{
  const outletId=req.params.outletId;
  const rawMaterialId=req.params.rawMaterialId;
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    if(req.user.level!="Owner"){
      return res.send("You are not authorised");
    }
    const outlet = await Outlet.findById(outletId ,'inventory_id Owner_id' );
    const rawMaterial = await RawMaterial.findById(rawMaterialId);
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    if(outlet.Owner_id!=req.user.Owner_id){
      return res.status(404).json({ error: 'You are not authoried to access this outlet'});
    }
    if (!rawMaterial) {
      return res.status(404).json({ error: 'rawMaterial not found' });
    }
    const updatedRawMaterial = await RawMaterial.findByIdAndUpdate(
      rawMaterialId,
      {$inc: { "today_Quantity": req.body.quantity, "yesterday_Quantity":req.body.quantity }},
      { new: true } 
    );
  session.commitTransaction();
  session.endSession();
    res.send(updatedRawMaterial);
  } catch (error) {
    console.error('Error in getting menu:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//use by outlet manager and owner both
app.put('/outlet/dailyupdateofinventory/:outletId/:rawMaterialId', verifyToken, async(req,res)=>{
  const outletId=req.params.outletId;
  const rawMaterialId=req.params.rawMaterialId;
  try{

    if(req.user.level!="Owner"||req.user.level!="manager"){
      return res.send("You are not authorised to set availablity");
    }

    const outlet = await Outlet.findById(outletId ,'inventory_id Owner_id');
    const rawMaterial = await RawMaterial.findById(rawMaterialId);
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    if((req.user.level=="Owner")&&(outlet.Owner_id!=req.user.Owner_id)){
      return res.status(404).json({ error: 'You are not authoried to access this outlet'});
    }else if((req.user.level=="manager")){
      const manager =await Managersql.findByPk(req.user.Manager_id,{attributes:['workingAt']});
      if(manager.dataValues.workingAt!=outletId){
  
      return res.status(404).json({ error: 'You are not authoried to access this outlet'});
    }}
    if (!rawMaterial) {
      return res.status(404).json({ error: 'rawMaterial not found' });
    }
    const updatedRawMaterial = await RawMaterial.findByIdAndUpdate(
      rawMaterialId,
      {$set: { "today_Quantity": req.body.quantity}},
      { new: true } 
    );
    res.send(updatedRawMaterial);
  } catch (error) {
    console.error('Error in getting menu:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// use by owner
app.get('/outlet/todayservedorders/:outletId',verifyToken ,async(req,res)=>{
  const outletId=req.params.outletId;
  try{
    if(req.user.level!="Owner"){
      return res.send("You are not authorised");
    }
    const outlet = await Outlet.findById(outletId ,'Todayserved_list Owner_id');
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    if(outlet.Owner_id!=req.user.Owner_id){
      return res.status(404).json({ error: 'You are not authoried to access this outlet'});
    }
    const todayOrders =await orderOfOutlet.findById(outlet.Todayserved_list).populate("orders_ids");
    console.log(todayOrders);
    res.json(todayOrders);
  } catch (error) {
    console.error('Error in getting toayOrders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.get('/outlet/todaypredictedinventoryusage/:outletId',async(req,res)=>{
//   const outletId=req.params.outletId;
//   try{
//     const predictInventory =req.body.predictInventory;
//     const outlet = await Outlet.findById(outletId ,'Todayserved_list');
//     if (!outlet) {
//       return res.status(404).json({ error: 'Outlet not found' });
//     }
//     let todayOrdersids =await orderOfOutlet.findById(outlet.Todayserved_list);
//     todayOrdersids =todayOrdersids.orders_ids;
//     console.log(todayOrdersids);
//     let i=0;
//     const itemsFrequency = new Map();
//     const ObjectIds = new Map();
//     let todaySale=0;
//     for(i=0;i<todayOrdersids.length;i++){
//       let orderItems =await Order.findById(todayOrdersids[i],"Items");
//       orderItems=orderItems.Items;
//       for (const item of orderItems) {
//         todaySale+=item.Price*item.Quantity;
//         if (itemsFrequency.has(String(item.item_id))) {
//             itemsFrequency.set(String(item.item_id), itemsFrequency.get(String(item.item_id)) + item.Quantity);
//         } else {
//           ObjectIds.set(String(item.item_id),item.item_id);
//             itemsFrequency.set(String(item.item_id), 1);
//         }
//     }
//     }
//     let result=[];
//     for (const [key, value] of itemsFrequency.entries()) {
//       result.push({ key, value });
//   }
//   let todayAnalysis ={
//     todaySale,
//     result
//   };

//   console.log(itemsFrequency);
//   if(predictInventory==0){
//     res.json(todayAnalysis);
//   }
//   let rr=[];
//   for(i=0;i<result.length;i++){
//     // let itemsRequirements =await Item.findById(ObjectIds[result[i]],'requirements');
//     rr.push([result[i]].key);
//   }
//   res.json(result);
//   }catch (error){
//     console.error('Error in getting toayOrders:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
app.listen(3000,() =>{
    console.log('i m listening');
});