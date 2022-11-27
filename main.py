import praw

id: str = "A060JiFHJH0KYKJMQwCVig"
secret: str = "1mjxB74fBwrvLjl3wU_UjDh__UTsyA"


reddit = praw.Reddit(
    client_id=id,
    client_secret=secret,
    user_agent="appstring",
)


uniques = set()

for comment in reddit.redditor('elon-bot').comments.new(limit=None):

    # Print the text (body) of each comment
    string = comment.body
    if string not in uniques:
        print("[unique] ", string)
        uniques.add(string)
    else:
        print("[dupe]: ", string)
