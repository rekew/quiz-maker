"""seed 100 demo quizzes

Revision ID: 0003
Revises: 0002
Create Date: 2026-10-20
"""

import uuid
from datetime import datetime, timedelta, timezone

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

NAMESPACE = uuid.UUID("c8f6b8d8-9e56-4f6e-9f0c-2c6f5c1c7a11")
BASE_TIME = datetime(2026, 1, 1, tzinfo=timezone.utc)

FOLDERS = [
    ("Geography & Science", ["Geography", "Science"]),
    ("History & Technology", ["History", "Technology"]),
    ("Literature & Sports", ["Literature", "Sports"]),
    ("Music & Movies", ["Music", "Movies"]),
    ("Food & Nature", ["Food", "Nature"]),
]

QUESTIONS: dict[str, list[tuple[str, str, str, str, str]]] = {
    "Geography": [
        ("What is the capital of France?", "Paris", "Berlin", "Rome", "Madrid"),
        ("Which is the largest ocean?", "Pacific", "Atlantic", "Indian", "Arctic"),
        ("Which river is the longest?", "Nile", "Amazon", "Yangtze", "Danube"),
        ("What is the capital of Japan?", "Tokyo", "Seoul", "Beijing", "Bangkok"),
        ("On which continent is the Sahara?", "Africa", "Asia", "Australia", "South America"),
        ("Which country has the largest population?", "India", "China", "USA", "Indonesia"),
        ("What is the capital of Canada?", "Ottawa", "Toronto", "Vancouver", "Montreal"),
        ("Which is the largest country by area?", "Russia", "Canada", "China", "USA"),
        ("The Andes are in which continent?", "South America", "Europe", "Asia", "Africa"),
        ("What is the capital of Australia?", "Canberra", "Sydney", "Melbourne", "Perth"),
    ],
    "Science": [
        ("What is the chemical formula for water?", "H2O", "CO2", "O2", "NaCl"),
        ("Which planet is closest to the Sun?", "Mercury", "Venus", "Earth", "Mars"),
        ("Which gas do plants absorb?", "Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"),
        ("What is the approximate speed of light?", "300,000 km/s", "3,000 km/s", "30,000 km/s", "3,000,000 km/s"),
        ("What is the largest human organ?", "Skin", "Liver", "Brain", "Lungs"),
        ("What force pulls objects toward Earth?", "Gravity", "Magnetism", "Friction", "Tension"),
        ("What is the smallest unit of life?", "Cell", "Atom", "Molecule", "Organ"),
        ("How many bones does an adult human have?", "206", "106", "306", "406"),
        ("Which planet is called the Red Planet?", "Mars", "Jupiter", "Venus", "Saturn"),
        ("What is the chemical symbol for gold?", "Au", "Ag", "Fe", "Cu"),
    ],
    "History": [
        ("Who was the first US president?", "George Washington", "Abraham Lincoln", "Thomas Jefferson", "John Adams"),
        ("Which civilization built the pyramids?", "Egypt", "Rome", "Greece", "Persia"),
        ("In what year did World War II end?", "1945", "1939", "1918", "1950"),
        ("When did the Berlin Wall fall?", "1989", "1961", "1979", "1991"),
        ("In what year did Columbus sail to the Americas?", "1492", "1392", "1592", "1692"),
        ("What was the capital of the Roman Empire?", "Rome", "Athens", "Cairo", "Paris"),
        ("When did the French Revolution begin?", "1789", "1689", "1889", "1589"),
        ("Who was the first person on the Moon?", "Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "John Glenn"),
        ("In what year did the Titanic sink?", "1912", "1902", "1922", "1932"),
        ("When was the Magna Carta signed?", "1215", "1115", "1315", "1415"),
    ],
    "Technology": [
        ("What does HTTP stand for?", "HyperText Transfer Protocol", "High Tech Transfer Process", "Hyperlink Text Transport Program", "Home Tool Transfer Protocol"),
        ("Which language styles web pages?", "CSS", "HTML", "Python", "SQL"),
        ("What does CPU stand for?", "Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Control Processing User"),
        ("Which company created the iPhone?", "Apple", "Google", "Microsoft", "Samsung"),
        ("Which digits are used in binary?", "0 and 1", "1 and 2", "0 and 2", "A and B"),
        ("Which company created React?", "Meta", "Google", "Microsoft", "Amazon"),
        ("What is SQL used for?", "Databases", "Styling", "Networking", "Images"),
        ("What is Git used for?", "Version control", "Image editing", "Audio mixing", "Spreadsheets"),
        ("Which protocol is secure?", "HTTPS", "FTP", "SMTP", "HTTP"),
        ("What is RAM?", "Volatile memory", "Permanent storage", "A processor", "A graphics card"),
    ],
    "Literature": [
        ("Who wrote Hamlet?", "William Shakespeare", "Charles Dickens", "Jane Austen", "Ernest Hemingway"),
        ("Who wrote Harry Potter?", "J.K. Rowling", "J.R.R. Tolkien", "C.S. Lewis", "Stephen King"),
        ("Who wrote 1984?", "George Orwell", "Aldous Huxley", "Ray Bradbury", "H.G. Wells"),
        ("Who wrote Pride and Prejudice?", "Jane Austen", "Charlotte Brontë", "Virginia Woolf", "George Eliot"),
        ("Who is credited with The Odyssey?", "Homer", "Virgil", "Plato", "Aristotle"),
        ("Who wrote The Lord of the Rings?", "J.R.R. Tolkien", "C.S. Lewis", "George Orwell", "J.K. Rowling"),
        ("Who wrote Moby Dick?", "Herman Melville", "Mark Twain", "Ernest Hemingway", "F. Scott Fitzgerald"),
        ("Who wrote Romeo and Juliet?", "William Shakespeare", "Geoffrey Chaucer", "John Milton", "John Keats"),
        ("Who wrote To Kill a Mockingbird?", "Harper Lee", "Toni Morrison", "William Faulkner", "John Steinbeck"),
        ("Who wrote Brave New World?", "Aldous Huxley", "George Orwell", "Ray Bradbury", "Lois Lowry"),
    ],
    "Sports": [
        ("How many players are on a soccer team?", "11", "10", "9", "12"),
        ("How many Olympic rings are there?", "5", "4", "6", "7"),
        ("What surface is the French Open played on?", "Clay", "Grass", "Hard", "Carpet"),
        ("How many points is a free throw in basketball?", "1", "2", "3", "4"),
        ("How often is the FIFA World Cup held?", "Every 4 years", "Every 2 years", "Every 3 years", "Every 5 years"),
        ("Which sport uses a shuttlecock?", "Badminton", "Tennis", "Squash", "Table tennis"),
        ("What is the approximate marathon distance?", "42 km", "21 km", "10 km", "50 km"),
        ("Ice hockey is played on what?", "Ice", "Sand", "Grass", "Water"),
        ("What sport is the Tour de France?", "Cycling", "Running", "Swimming", "Rowing"),
        ("What shape is a boxing ring?", "Square", "Circle", "Oval", "Triangle"),
    ],
    "Music": [
        ("Which instrument has 88 keys?", "Piano", "Guitar", "Violin", "Flute"),
        ("Where are the Beatles from?", "Liverpool", "London", "Manchester", "Dublin"),
        ("What does piano mean in music?", "Soft", "Loud", "Fast", "Slow"),
        ("Who is known as the Queen of Pop?", "Madonna", "Beyoncé", "Adele", "Taylor Swift"),
        ("Which instrument uses a bow?", "Violin", "Trumpet", "Drum", "Piano"),
        ("How many lines are in a musical staff?", "5", "4", "6", "7"),
        ("What was Mozart's first name?", "Wolfgang", "Ludwig", "Johann", "Franz"),
        ("What genre is Bob Marley known for?", "Reggae", "Jazz", "Rock", "Country"),
        ("What does an orchestra conductor use?", "Baton", "Bow", "Pick", "Mallet"),
        ("What is the highest female singing voice?", "Soprano", "Alto", "Tenor", "Bass"),
    ],
    "Movies": [
        ("Who directed Jaws?", "Steven Spielberg", "George Lucas", "Alfred Hitchcock", "Christopher Nolan"),
        ("What is the Academy Award statue called?", "Oscar", "Emmy", "Grammy", "Tony"),
        ("Which studio made Toy Story?", "Pixar", "DreamWorks", "Disney", "Warner Bros"),
        ("Who is the protagonist of The Matrix?", "Neo", "Luke", "Frodo", "John"),
        ("Which film features 'May the Force be with you'?", "Star Wars", "Star Trek", "Dune", "Alien"),
        ("Who directed Avatar?", "James Cameron", "Ridley Scott", "Steven Spielberg", "Christopher Nolan"),
        ("Which series is set at a wizarding school?", "Harry Potter", "Narnia", "Twilight", "The Hunger Games"),
        ("Which animated film features a lion cub?", "The Lion King", "Bambi", "Dumbo", "Tarzan"),
        ("What is the top prize at Cannes?", "Palme d'Or", "Oscar", "BAFTA", "Golden Globe"),
        ("What is Jurassic Park about?", "Dinosaurs", "Aliens", "Robots", "Pirates"),
    ],
    "Food": [
        ("What is the main ingredient in guacamole?", "Avocado", "Tomato", "Potato", "Onion"),
        ("Which pasta dish uses eggs and bacon?", "Carbonara", "Pesto", "Alfredo", "Bolognese"),
        ("Where did sushi originate?", "Japan", "China", "Korea", "Thailand"),
        ("Which fruit is rich in potassium?", "Banana", "Apple", "Orange", "Grape"),
        ("Where did espresso originate?", "Italy", "France", "Spain", "Greece"),
        ("What makes bread dough rise?", "Yeast", "Salt", "Sugar", "Oil"),
        ("Which cheese is from Italy?", "Parmesan", "Cheddar", "Brie", "Gouda"),
        ("Where did tacos originate?", "Mexico", "Spain", "Peru", "Italy"),
        ("Which vitamin is found in oranges?", "Vitamin C", "Vitamin A", "Vitamin D", "Vitamin B12"),
        ("Chocolate comes from which plant?", "Cacao", "Coffee", "Sugar", "Vanilla"),
    ],
    "Nature": [
        ("What is the largest land animal?", "African elephant", "Giraffe", "Rhino", "Hippo"),
        ("Which animal is called king of the jungle?", "Lion", "Tiger", "Elephant", "Bear"),
        ("How do plants make food?", "Photosynthesis", "Respiration", "Digestion", "Transpiration"),
        ("What is the largest mammal?", "Blue whale", "Elephant", "Giraffe", "Orca"),
        ("Which animal has black and white stripes?", "Zebra", "Tiger", "Panda", "Horse"),
        ("Where are rainforests mostly found?", "Near the equator", "At the poles", "In deserts", "On mountains"),
        ("Which bird cannot fly?", "Penguin", "Eagle", "Parrot", "Sparrow"),
        ("Which flower symbolizes love?", "Rose", "Tulip", "Daisy", "Lily"),
        ("What is the fastest land animal?", "Cheetah", "Lion", "Horse", "Leopard"),
        ("What insect makes honey?", "Bees", "Ants", "Wasps", "Butterflies"),
    ],
}


def _question(row: tuple[str, str, str, str, str]) -> dict:
    text, correct, *wrong = row
    return {
        "question": text,
        "options": [correct, *wrong],
        "correctIndices": [0],
    }


def _folder_id(title: str) -> uuid.UUID:
    return uuid.uuid5(NAMESPACE, f"folder:{title}")


def _quiz_id(category: str, set_number: int) -> uuid.UUID:
    return uuid.uuid5(NAMESPACE, f"quiz:{category}:{set_number}")


def upgrade() -> None:
    folders = sa.table(
        "folders",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("title", sa.Text),
        sa.column("created_at", sa.DateTime(timezone=True)),
    )
    quizzes = sa.table(
        "quizzes",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("title", sa.Text),
        sa.column("raw_text", sa.Text),
        sa.column("questions", postgresql.JSONB),
        sa.column("created_at", sa.DateTime(timezone=True)),
        sa.column("folder_id", postgresql.UUID(as_uuid=True)),
        sa.column("position", sa.Integer),
    )

    folder_rows = [
        {"id": _folder_id(title), "title": title, "created_at": BASE_TIME}
        for title, _ in FOLDERS
    ]
    op.bulk_insert(folders, folder_rows)

    positions: dict[str, int] = {title: 0 for title, _ in FOLDERS}
    quiz_rows = []
    global_index = 0
    for folder_title, categories in FOLDERS:
        for category in categories:
            bank = QUESTIONS[category]
            for set_index in range(10):
                positions[folder_title] += 1
                selected = [_question(bank[(set_index + offset) % len(bank)]) for offset in range(5)]
                title = f"{category} Practice — Set {set_index + 1}"
                quiz_rows.append(
                    {
                        "id": _quiz_id(category, set_index + 1),
                        "title": title,
                        "raw_text": f"Seeded demo quiz for {category}, set {set_index + 1}.",
                        "questions": selected,
                        "created_at": BASE_TIME + timedelta(hours=global_index),
                        "folder_id": _folder_id(folder_title),
                        "position": positions[folder_title],
                    }
                )
                global_index += 1

    op.bulk_insert(quizzes, quiz_rows)


def downgrade() -> None:
    quizzes = sa.table(
        "quizzes",
        sa.column("id", postgresql.UUID(as_uuid=True)),
    )
    folders = sa.table(
        "folders",
        sa.column("id", postgresql.UUID(as_uuid=True)),
    )
    quiz_ids = [
        _quiz_id(category, set_number)
        for _, categories in FOLDERS
        for category in categories
        for set_number in range(1, 11)
    ]
    folder_ids = [_folder_id(title) for title, _ in FOLDERS]
    op.execute(quizzes.delete().where(quizzes.c.id.in_(quiz_ids)))
    op.execute(folders.delete().where(folders.c.id.in_(folder_ids)))
