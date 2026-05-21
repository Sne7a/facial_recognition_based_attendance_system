from typing import Optional
import datetime

from sqlalchemy import CheckConstraint, Column, Date, DateTime, Enum, ForeignKeyConstraint, Index, Integer, String, Table, Time, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):        
    pass


class AcademicSessions(Base):       
    __tablename__ = 'academic_sessions'
    __table_args__ = {'comment': 'Stores information about each academic session or term, including '       
                'its name, start date, and end date. Used to organize classes and '
                'attendance within a specific time period like Spring or Fall.\n'}

    session_id: Mapped[int] = mapped_column(Integer, primary_key=True)  
    name: Mapped[Optional[str]] = mapped_column(String(100))
    start_date: Mapped[Optional[datetime.date]] = mapped_column(Date)   
    end_date: Mapped[Optional[datetime.date]] = mapped_column(Date)     

    classes: Mapped[list['Classes']] = relationship('Classes', back_populates='session')


class Permissions(Base):
    __tablename__ = 'permissions'   
    __table_args__ = (
        Index('operation_name', 'operation_name', unique=True),
    )

    permission_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    operation_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255))     

    role: Mapped[list['Roles']] = relationship('Roles', secondary='role_permissions', back_populates='permission')


class Roles(Base):
    __tablename__ = 'roles'
    __table_args__ = (
        Index('role_name', 'role_name', unique=True),
    )

    role_id: Mapped[int] = mapped_column(Integer, primary_key=True)     
    role_name: Mapped[str] = mapped_column(String(100), nullable=False) 

    permission: Mapped[list['Permissions']] = relationship('Permissions', secondary='role_permissions', back_populates='role')
    user: Mapped[list['Users']] = relationship('Users', secondary='user_roles', back_populates='role')      


class Semesters(Base):
    __tablename__ = 'semesters'     
    __table_args__ = {'comment': 'Represents semester divisions inside the academic structure '
                '(e.g., Semester 1, Semester 2). Used to group subjects and '
                'determine which content belongs to which part of the academic '
                'year.\n'}

    semester_id: Mapped[int] = mapped_column(Integer, primary_key=True) 
    name: Mapped[str] = mapped_column(String(50), nullable=False)       

    subjects: Mapped[list['Subjects']] = relationship('Subjects', back_populates='semester')


class Users(Base):
    __tablename__ = 'users'
    __table_args__ = (
        Index('email', 'email', unique=True),
        {'comment': 'Contains login credentials and role information for every person '
                'using the system. Supports authentication and access control for '
                'admins, teachers, parents, and students.\n'}
    )

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)     
    email: Mapped[str] = mapped_column(String(100), nullable=False)     
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    role: Mapped[list['Roles']] = relationship('Roles', secondary='user_roles', back_populates='user')      
    admins: Mapped[list['Admins']] = relationship('Admins', back_populates='user')
    parents: Mapped[list['Parents']] = relationship('Parents', back_populates='user')
    students: Mapped[list['Students']] = relationship('Students', back_populates='user')
    teachers: Mapped[list['Teachers']] = relationship('Teachers', back_populates='user')


class Admins(Base):
    __tablename__ = 'admins'        
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.user_id'], name='admins_ibfk_1'),
        Index('user_id', 'user_id'),
        {'comment': 'Stores details of administrative staff members who manage the '
                'system. Each admin is linked to a user account and may perform '
                'operations such as creating classes, managing attendance, and '
                'updating records.\n'}
    )

    admin_id: Mapped[int] = mapped_column(Integer, primary_key=True)    
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)       
    first_name: Mapped[Optional[str]] = mapped_column(String(50))       
    last_name: Mapped[Optional[str]] = mapped_column(String(50))        
    job_title: Mapped[Optional[str]] = mapped_column(String(100))       

    user: Mapped['Users'] = relationship('Users', back_populates='admins')


class Parents(Base):
    __tablename__ = 'parents'       
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.user_id'], name='parents_ibfk_1'),
        Index('user_id', 'user_id'),
        {'comment': 'Contains parent or guardian profile information, linked to user '
                'accounts. Used for login access, receiving updates, viewing '
                "attendance, and monitoring their children's academic " 
                'performance.\n'}   
    )

    parent_id: Mapped[int] = mapped_column(Integer, primary_key=True)   
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)       
    first_name: Mapped[Optional[str]] = mapped_column(String(50))       
    last_name: Mapped[Optional[str]] = mapped_column(String(50))        
    phone_number: Mapped[Optional[str]] = mapped_column(String(20))     

    user: Mapped['Users'] = relationship('Users', back_populates='parents')
    student: Mapped[list['Students']] = relationship('Students', secondary='student_parent_link', back_populates='parent')


t_role_permissions = Table(
    'role_permissions', Base.metadata,
    Column('role_id', Integer, primary_key=True),
    Column('permission_id', Integer, primary_key=True),
    ForeignKeyConstraint(['permission_id'], ['permissions.permission_id'], ondelete='CASCADE', name='role_permissions_ibfk_2'),
    ForeignKeyConstraint(['role_id'], ['roles.role_id'], ondelete='CASCADE', name='role_permissions_ibfk_1'),
    Index('permission_id', 'permission_id')
)


class Students(Base):
    __tablename__ = 'students'      
    __table_args__ = (
        CheckConstraint('(`curr_semester` between 1 and 10)', name='students_chk_1'),
        ForeignKeyConstraint(['user_id'], ['users.user_id'], name='students_ibfk_1'),
        Index('user_id', 'user_id'),
        {'comment': 'Stores student profile information such as name and current '
                'semester. Each student is associated with a user account for '
                'login access and attendance tracking.\n'}
    )

    student_id: Mapped[int] = mapped_column(Integer, primary_key=True)  
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)       
    first_name: Mapped[Optional[str]] = mapped_column(String(50))       
    last_name: Mapped[Optional[str]] = mapped_column(String(50))        
    curr_semester: Mapped[Optional[int]] = mapped_column(Integer)       

    parent: Mapped[list['Parents']] = relationship('Parents', secondary='student_parent_link', back_populates='student')
    user: Mapped['Users'] = relationship('Users', back_populates='students')
    student_images: Mapped[list['StudentImages']] = relationship('StudentImages', back_populates='student') 
    enrollments: Mapped[list['Enrollments']] = relationship('Enrollments', back_populates='student')        
    attendance_records: Mapped[list['AttendanceRecords']] = relationship('AttendanceRecords', back_populates='student')


class Subjects(Base):
    __tablename__ = 'subjects'      
    __table_args__ = (
        ForeignKeyConstraint(['semester_id'], ['semesters.semester_id'], name='subjects_ibfk_1'),
        Index('semester_id', 'semester_id'),
        Index('subject_code', 'subject_code', unique=True),
        {'comment': 'Stores the academic subjects offered by the institution, such as '
                'Mathematics, Science, English, etc. Each subject may belong to a '
                'specific semester and can have one or more classes taught in '
                'different sessions.\n'}
    )

    subject_id: Mapped[int] = mapped_column(Integer, primary_key=True)  
    subject_name: Mapped[Optional[str]] = mapped_column(String(100))    
    subject_code: Mapped[Optional[str]] = mapped_column(String(50))
    semester_id: Mapped[Optional[int]] = mapped_column(Integer)

    semester: Mapped[Optional['Semesters']] = relationship('Semesters', back_populates='subjects')
    classes: Mapped[list['Classes']] = relationship('Classes', back_populates='subject')


class Teachers(Base):
    __tablename__ = 'teachers'      
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.user_id'], name='teachers_ibfk_1'),
        Index('user_id', 'user_id'),
        {'comment': 'Stores teacher information such as name, department, and employee '
                'ID. Each teacher is linked to a user account and is responsible '
                'for teaching one or more classes.\n'}
    )

    teacher_id: Mapped[int] = mapped_column(Integer, primary_key=True)  
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)       
    first_name: Mapped[Optional[str]] = mapped_column(String(50))       
    last_name: Mapped[Optional[str]] = mapped_column(String(50))        
    department: Mapped[Optional[str]] = mapped_column(String(100))      

    user: Mapped['Users'] = relationship('Users', back_populates='teachers')
    classes: Mapped[list['Classes']] = relationship('Classes', back_populates='teacher')


t_user_roles = Table(
    'user_roles', Base.metadata,    
    Column('user_id', Integer, primary_key=True),
    Column('role_id', Integer, primary_key=True),
    ForeignKeyConstraint(['role_id'], ['roles.role_id'], ondelete='CASCADE', name='user_roles_ibfk_2'),     
    ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE', name='user_roles_ibfk_1'),     
    Index('role_id', 'role_id')     
)


class Classes(Base):
    __tablename__ = 'classes'       
    __table_args__ = (
        ForeignKeyConstraint(['session_id'], ['academic_sessions.session_id'], name='classes_ibfk_2'),      
        ForeignKeyConstraint(['subject_id'], ['subjects.subject_id'], name='classes_ibfk_1'),
        ForeignKeyConstraint(['teacher_id'], ['teachers.teacher_id'], name='classes_ibfk_3'),
        Index('session_id', 'session_id'),
        Index('subject_id', 'subject_id', 'session_id', 'teacher_id', unique=True),
        Index('teacher_id', 'teacher_id'),
        {'comment': 'Represents an actual class being taught for a subject during an '
                'academic session. Connects a subject, teacher, and session '
                'together, ensuring that each class has an instructor and a '
                'defined schedule.\n'}
    )

    class_id: Mapped[int] = mapped_column(Integer, primary_key=True)    
    subject_id: Mapped[int] = mapped_column(Integer, nullable=False)    
    session_id: Mapped[int] = mapped_column(Integer, nullable=False)    
    teacher_id: Mapped[int] = mapped_column(Integer, nullable=False)    

    session: Mapped['AcademicSessions'] = relationship('AcademicSessions', back_populates='classes')        
    subject: Mapped['Subjects'] = relationship('Subjects', back_populates='classes')
    teacher: Mapped['Teachers'] = relationship('Teachers', back_populates='classes')
    class_schedules: Mapped[list['ClassSchedules']] = relationship('ClassSchedules', back_populates='class_')
    enrollments: Mapped[list['Enrollments']] = relationship('Enrollments', back_populates='class_')


class StudentImages(Base):
    __tablename__ = 'student_images'
    __table_args__ = (
        ForeignKeyConstraint(['student_id'], ['students.student_id'], name='student_images_ibfk_1'),        
        Index('student_id', 'student_id'),
        {'comment': 'Stores file paths or URLs to student profile images. Allows the '
                "system to display a student's photograph inside portals and "
                'attendance reports.\n'}
    )

    img_id: Mapped[int] = mapped_column(Integer, primary_key=True)      
    student_id: Mapped[int] = mapped_column(Integer, nullable=False)    
    img_path: Mapped[Optional[str]] = mapped_column(String(255))        

    student: Mapped['Students'] = relationship('Students', back_populates='student_images')


t_student_parent_link = Table(      
    'student_parent_link', Base.metadata,
    Column('student_id', Integer, primary_key=True),
    Column('parent_id', Integer, primary_key=True),
    ForeignKeyConstraint(['parent_id'], ['parents.parent_id'], name='student_parent_link_ibfk_2'),
    ForeignKeyConstraint(['student_id'], ['students.student_id'], name='student_parent_link_ibfk_1'),       
    Index('parent_id', 'parent_id'),
    comment='Maps students to their parents or guardians. A student can have multiple linked parents, and a parent can be linked to multiple students, supporting siblings and guardianship relationships.\n'
)


class ClassSchedules(Base):
    __tablename__ = 'class_schedules'
    __table_args__ = (
        ForeignKeyConstraint(['class_id'], ['classes.class_id'], name='class_schedules_ibfk_1'),
        Index('class_id', 'class_id'),
        {'comment': 'Defines the weekly schedule for each class, including day of the '
                'week, start time, end time, and classroom. This table allows the '
                'system to know when and where a specific class occurs.\n'}
    )

    schedule_id: Mapped[int] = mapped_column(Integer, primary_key=True) 
    class_id: Mapped[int] = mapped_column(Integer, nullable=False)      
    day_of_week: Mapped[Optional[str]] = mapped_column(Enum('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'))
    start_time: Mapped[Optional[datetime.time]] = mapped_column(Time)   
    end_time: Mapped[Optional[datetime.time]] = mapped_column(Time)     
    room_identifier: Mapped[Optional[str]] = mapped_column(String(50))  

    class_: Mapped['Classes'] = relationship('Classes', back_populates='class_schedules')
    attendance_records: Mapped[list['AttendanceRecords']] = relationship('AttendanceRecords', back_populates='schedule')


class Enrollments(Base):
    __tablename__ = 'enrollments'   
    __table_args__ = (
        ForeignKeyConstraint(['class_id'], ['classes.class_id'], name='enrollments_ibfk_2'),
        ForeignKeyConstraint(['student_id'], ['students.student_id'], name='enrollments_ibfk_1'),
        Index('class_id', 'class_id'),
        Index('student_id', 'student_id', 'class_id', unique=True),     
        {'comment': 'Stores which students are registered for which classes. Prevents '
                'duplicate enrollment and ensures the system knows which students '
                'should attend each scheduled session of a class.\n'}   
    )

    enrol_id: Mapped[int] = mapped_column(Integer, primary_key=True)    
    student_id: Mapped[int] = mapped_column(Integer, nullable=False)    
    class_id: Mapped[int] = mapped_column(Integer, nullable=False)      

    class_: Mapped['Classes'] = relationship('Classes', back_populates='enrollments')
    student: Mapped['Students'] = relationship('Students', back_populates='enrollments')


class AttendanceRecords(Base):      
    __tablename__ = 'attendance_records'
    __table_args__ = (
        ForeignKeyConstraint(['schedule_id'], ['class_schedules.schedule_id'], name='attendance_records_ibfk_2'),
        ForeignKeyConstraint(['student_id'], ['students.student_id'], name='attendance_records_ibfk_1'),    
        Index('schedule_id', 'schedule_id'),
        Index('student_id', 'student_id'),
        {'comment': 'Contains detailed daily attendance logs for every student in '
                'every scheduled class. Each record shows whether a student was '
                'present, absent, or late, along with the date and timestamp when '
                'attendance was recorded.\n'}
    )

    attend_id: Mapped[int] = mapped_column(Integer, primary_key=True)   
    student_id: Mapped[int] = mapped_column(Integer, nullable=False)    
    schedule_id: Mapped[int] = mapped_column(Integer, nullable=False)   
    attend_date: Mapped[Optional[datetime.date]] = mapped_column(Date)  
    recorded_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    status: Mapped[Optional[str]] = mapped_column(Enum('present', 'absent', 'late'), server_default=text("'absent'"))

    schedule: Mapped['ClassSchedules'] = relationship('ClassSchedules', back_populates='attendance_records')
    student: Mapped['Students'] = relationship('Students', back_populates='attendance_records')