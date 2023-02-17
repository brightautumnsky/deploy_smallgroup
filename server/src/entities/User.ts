import { IsEmail, Length } from "class-validator";
import { Entity, Column, Index, OneToMany, BeforeInsert } from "typeorm";
import BaseEntity from "./Entity";
import bcrypt from "bcryptjs";
import Post from "./Post";
import Like from "./Like";

@Entity("users")
export default class User extends BaseEntity {
  @Index()
  @IsEmail(undefined, { message: "이메일 형식이 아닙니다." })
  @Length(1, 255, { message: "이메일 주소를 입력해주세요." })
  @Column({ unique: true })
  email: string;

  @Index()
  @Length(3, 30, { message: "이름은 3자 이상이어야 합니다." })
  @Column({ unique: true })
  username: string;

  @Column()
  @Length(6, 255, { message: "비밀번호는 6자리 이상이어야 합니다." })
  password: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}
