// SUNUCUYU BU DOSYAYA KURUN
const express = require("express");
const userModel = require("./users/model");

const server = express();
server.use(express.json());


server.post("/api/users", async(req,res)=>{
    try {
        let user = req.body;
        if(!user.name || !user.bio){
            res.status(400).json({message: "Lütfen kullanıcı için bir name ve bio sağlayın"});
        }else{
        let inserted =  await userModel.insert(user);
        res.status(201).json(inserted);
        /* userModel.insert(user).then((inserted)=>{
                res.status(201).json(inserted);
            }).catch((error)=>{
                res.status(500).json({message:"Veritabanına kaydedilirken bir hata oluştu"});
            })*/
        }
    } catch (error) {
        res.status(500).json({message:"Veritabanına kaydedilirken bir hata oluştu"});
    }
    
});

server.get("/api/users",async(req,res)=>{
    try {
        let allUsers = await userModel.find();
        res.json(allUsers);
    } catch (error) {
        res.status(500).json({message:"Kullanıcı bilgileri alınamadı"});
    }
    
});

server.get("/api/users/:id",async(req,res)=>{
    try {
        let id = req.params.id;
        let userById = await userModel.findById(id);
        if(!userById){
            res.status(404).json({message:"Belirtilen ID'li kullanıcı bulunamadı"});
        }else{
            res.json(userById);
        }
    } catch (error) {
        res.status(500).json({message:"Kullanıcı bilgileri alınamadı"});
    }
});

server.delete("/api/users/:id",async(req,res)=>{
    try {
        let id = req.params.id;
        let userById = await userModel.findById(id);
        if(!userById){
            res.status(404).json({message:"Belirtilen ID'li kullanıcı bulunamadı"});
        }else{
           let deletedUser = await userModel.remove(id);
           res.json(deletedUser);
        }
    } catch (error) {
        res.status(500).json({ message: "Kullanıcı silinemedi" });
    }
});

server.put("/api/users/:id",async(req,res)=>{
    try {
        let id = req.params.id;
        let userById = await userModel.findById(id);
        if(!userById){
            res.status(404).json({message:"Belirtilen ID'li kullanıcı bulunamadı"});
        }else{
            let user = req.body;
            if(!user.name || !user.bio){
                res.status(400).json({message: "Lütfen kullanıcı için bir name ve bio sağlayın"});
            }else{
                let updatedUser = await userModel.update(req.params.id,user);
                res.json(updatedUser);
            }
        }
    } catch (error) {
        res.status(500).json({message:"Kullanıcı bilgileri güncellenemedi"});
    }
});


module.exports = server; // SERVERINIZI EXPORT EDİN {}

