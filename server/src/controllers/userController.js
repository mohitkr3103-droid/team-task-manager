import User from '../models/User.js';

export const getUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) { next(error); }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) { next(error); }
};

export const updateUser = async (req, res, next) => {
  try {
    // Only admin can update other users
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const { name, role, department, bio, isActive, avatar } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (role && req.user.role === 'admin') updateFields.role = role;
    if (department !== undefined) updateFields.department = department;
    if (bio !== undefined) updateFields.bio = bio;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (isActive !== undefined && req.user.role === 'admin') updateFields.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User updated', data: user });
  } catch (error) { next(error); }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: 'User deactivated' });
  } catch (error) { next(error); }
};
