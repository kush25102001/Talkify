import cloudinary from "../libs/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("error in getAllContacts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessageById = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: partnerId } = req.params;

    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          receiverId: partnerId,
        },
        {
          senderId: partnerId,
          receiverId: myId,
        },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("error in getMessageById:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadImage = await cloudinary.uploader.upload(image);
      imageUrl = uploadImage.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    //todo: send message in real time if user is online - socket.io
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in sendMessage:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    //find all messages where the logged in user is either sender or receiver
    const messages = await Message.find({
      $or: [
        {senderId: loggedInUserId},
        {receiverId: loggedInUserId},
      ],
    });

    const partnerIds = [...new Set(
      messages.map((msg)=>
      msg.senderId.toString() === loggedInUserId.toString() 
      ? msg.receiverId.toString()
      : msg.senderId.toString()
      )
    ),
  ];

  const partners = await User.find({ _id: {$in: partnerIds}}).select('-password');

  res.status(200).json(partners);
  } catch (error) {
    console.log("error in getChatPartners",error);
    res.status(500).json({error: "internal server error"});
  }
};
