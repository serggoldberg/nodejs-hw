import { model, Schema } from 'mongoose';

const userSchema = new Schema(
  {
    username: { type: String, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true, min: 8 },
    avatar: {
      type: String,
      required: false,
      default: 'https://ac.goit.global/fullstack/react/default-avatar.jpg',
    },
  },
  { timestamps: true }, //Для автоматичного створення полів createdAt та updatedAt
);

// Перед збереженням, якщо username не вказано, встановлюємо -> email
userSchema.pre('save', function () {
  if (!this.username) {
    this.username = this.email;
  }
});

//видалям пароль із об'єкта користувача перед відправкою у відповідь
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password; //Видаляємо поле password з об'єкта, який буде повернутий клієнту
  return obj;
};
export const User = model('User', userSchema);
