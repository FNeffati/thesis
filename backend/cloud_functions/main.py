import functions_framework
import pandas as pd
import pymongo
import requests
import re


@functions_framework.http
def hello_http(request):
    main_queries = {
        "RedTide": '("red tide" OR "red tides" OR "red algae" OR #redtide OR "karenia brevis" OR kbrevis OR #kareniabrevis)',
        "AllAlgae": '((algae OR algal OR #algaebloom OR #algalbloom OR #toxicalgae OR #harmfulalgae) OR ("red tide" OR '
                    '"red tides" OR #redtide OR "karenia brevis" OR kbrevis OR #kareniabrevis) OR (#bluegreenalgae OR '
                    'cyanobacteria OR cyanotoxins OR Lyngbya OR Dapis))'
    }

    area_terms = {
        "Tampa": '(Tampa OR Tampas OR #TampaBay OR "TB area" OR ((Hillsborough OR HillsboroughCounty) (FL OR Florida OR '
                 'Bay)) OR "Apollo Beach" OR #ApolloBeach OR Wimauma OR ((Gibsonton OR Ruskin OR "Sun City") (FL OR '
                 'Florida)) OR "Davis Islands" OR "Alafia River" OR "McKay Bay")',
        "Pinellas.Clearwater": '(Pinellas OR PinellasCounty OR ((Clearwater OR Dunedin) (FL OR Florida)) OR "Clearwater '
                               'Beach" OR #ClearwaterBeach OR "Indian Rocks Beach" OR #IndianRocksBeach OR "Tarpon '
                               'Springs" OR #TarponSprings OR Belleair OR "Palm Harbor" OR #PalmHarbor OR "Safety Harbor")',
        "StPete": '(StPetersburg OR "St Petersburg" OR "St Pete" OR StPete OR #StPeteBeach OR "Madeira Beach" OR '
                  '#MadeiraBeach OR (("Treasure Island" OR "Tierra Verde") (FL OR Florida)) OR "Sunshine Skyway" OR "Fort '
                  'De Soto" OR (Redington (Beach OR Shores)) OR "Pass a grille")',
        "Manatee": '("Manatee county" OR ManateeCounty OR Bradenton OR Bradentons OR #BradentonBeach OR "Anna Maria '
                   'Island" OR #AnnaMariaIsland OR "Longboat Key" OR #LongboatKey OR "Holmes Beach" OR #HolmesBeach OR '
                   '"Manatee River" OR #ManateeRiver OR "Port Manatee")',
        "Sarasota": '(Sarasota OR Sarasotas OR SarasotaCounty OR "Siesta Key Beach" OR #SiestaKeyBeach OR ((Venice OR '
                    'Englewood OR "North Port" OR #NorthPort OR "Lido Beach") (FL OR Florida)) OR "Casey Key" OR '
                    '#CaseyKey OR Nokomis OR "Lemon Bay" OR #LemonBay OR "St Armands")',
        "Pasco": '(((Pasco (county OR counties OR Florida OR FL)) OR PascoCounty OR "Port Richey" OR #PortRichey OR (('
                 '"Bayonet Point" OR Anclote OR Elfers OR "Shady Hills") (FL OR Florida)) OR "Cotee River" OR '
                 'Pithlachascotee OR "Jasmine Estates" OR Aripeka -@Lou_Port_Richey)'
    }

    query_words = {
        "Tampa": ["Tampa", "Tampas", "#TampaBay", "TB area", "Hillsborough", "HillsboroughCounty", "Apollo Beach",
                  "#ApolloBeach", "Wimauma", "Gibsonton", "Ruskin", "Sun City", "Hillsborough Bay", "Davis Islands",
                  "Alafia River", "McKay Bay", "lake thonotosassa"],
        "Pinellas.Clearwater": ["Pinellas", "PinellasCounty", "Clearwater", "Dunedin", "Clearwater Beach",
                                "#ClearwaterBeach", "Indian Rocks Beach", "#IndianRocksBeach", "Tarpon Springs",
                                "#TarponSprings", "Belleair", "Palm Harbor", "#PalmHarbor", "Safety Harbor",
                                "#SafetyHarbor", "Honeymoon Island", "Sand Key", "Caladesi", "Lake Tarpon"],
        "StPete": ["StPetersburg", "St Petersburg", "St Pete", "StPete", "#StPeteBeach", "Madeira Beach",
                   "#MadeiraBeach",
                   "Treasure Island", "Tierra Verde", "Sunshine Skyway", "Fort De Soto", "Fort DeSoto",
                   "Redington Beach",
                   "Redington Shores", "Pass a grille", "Boca Ciega Bay", "Egmont Key", "Weedon Island"],
        "Manatee": ["Manatee county", "Manatee counties", "ManateeCounty", "Bradenton", "Bradentons", "#BradentonBeach",
                    "Anna Maria Island", "#AnnaMariaIsland", "Longboat Key", "#LongboatKey", "Holmes Beach",
                    "#HolmesBeach",
                    "Manatee River", "#ManateeRiver", "Port Manatee", "Coquina Beach", "Terra Ceia", "Palma Sola Bay",
                    "Bishop Harbor", "lake manatee"],
        "Sarasota": ["Sarasota", "Sarasotas", "SarasotaCounty", "Siesta Key Beach", "#SiestaKeyBeach", "Venice",
                     "Englewood", "North Port", "#NorthPort", "Lido Beach", "Casey Key", "#CaseyKey", "Nokomis",
                     "Lemon Bay", "#LemonBay", "St Armands", "#StArmands", "Manasota Key", "#ManasotaKey",
                     "Manasota Beach",
                     "Englewood Beach", "Lido Key", "Caspersen Beach", "Stump Pass", "#SarasotaBay"],
        "Pasco": ["Pasco county", "Pasco counties", "PascoCounty", "Port Richey", "#PortRichey", "Bayonet Point",
                  "Anclote",
                  "Elfers", "Shady Hills", "Cotee River", "Pithlachascotee", "Jasmine Estates", "Key Vista", "Aripeka",
                  "Werner Boyce", "Three Rooker Island", "Beacon Square"]
    }

    bearer_token = "AAAAAAAAAAAAAAAAAAAAAIz1dwEAAAAAkRetyUamtse3CLMOy2wYoDZQQ0Y%3D1nDoYSBLz2mpNjY5KaVsdITqmXXbstnRyYhFG6Nq1SR6Q9pUwC"

    headers = {
        "Authorization": f"Bearer {bearer_token}"
    }

    def set_parameters(query_text, start_date, end_date=None, max_results='100',
                       tweet_fields='author_id,created_at,lang',
                       user_fields='location', expansions='author_id'):
        if len(start_date) == 10:
            start_date += 'T00:00:00Z'
        if end_date is None:
            end_date = start_date[:10]
        if len(end_date) == 10:
            end_date += 'T23:59:59Z'

        return {
            "query": query_text,
            "max_results": max_results,
            "start_time": start_date,
            "end_time": end_date,
            "tweet.fields": tweet_fields,
            "user.fields": user_fields,
            "expansions": expansions
        }

    def combine_queries(main_queries, area_terms):
        combined_queries = {}
        for area, term in area_terms.items():
            for main_query_name, main_query in main_queries.items():
                combined_query = f"{main_query} {term}"
                combined_queries[f"{main_query_name}_{area}"] = combined_query
        return combined_queries

    combined_queries = combine_queries(main_queries, area_terms)

    def query_twitter(params, iter_limit=10, search_type="recent"):
        output_df = pd.DataFrame()
        next_token = None

        for i in range(iter_limit):
            if next_token is not None:
                params["next_token"] = next_token

            response = requests.get(f"https://api.twitter.com/2/tweets/search/{search_type}", headers=headers,
                                    params=params)
            if response.status_code != 200:
                print(f"Error: {response.status_code}")
                print(response.text)  # Add this line to see the error message
                break

            data = response.json()
            page_data = pd.json_normalize(data)

            if 'includes.users' in data:
                users_data = pd.json_normalize(data, record_path=['includes', 'users'])
                page_data = page_data.merge(users_data, left_on='author_id', right_on='id', how='left')

            output_df = pd.concat([output_df, page_data], ignore_index=True)

            next_token = data.get('meta', {}).get('next_token')
            if next_token is None:
                break

        return output_df

    topic_dfs = {}

    for query_key in combined_queries.keys():
        query_text = combined_queries[query_key]
        print(f"{query_key}: {query_text}")

        # TODO: Figure this question out
        # Why would we even need the function "set_parameters" if we're using this?
        params = {
            "query": f"{query_text}",
            "max_results": '100',
            "media.fields": 'url',
            "tweet.fields": 'attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,'
                            'in_reply_to_user_id,lang,possibly_sensitive,public_metrics,referenced_tweets,'
                            'reply_settings,source',
            "user.fields": 'created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,'
                           'protected,public_metrics,url,verified,withheld',
            "expansions": 'geo.place_id,author_id',
            "place.fields": 'contained_within,country,country_code,full_name,geo,id,name,place_type'
        }

        df = query_twitter(params)
        topic_dfs[query_key] = df

    def process_tweets(tweets):
        def exclude_retweets(tweets):
            filtered_tweets = []
            for item in tweets.keys():
                try:
                    if tweets[item]['meta.result_count'][0] > 0:
                        tweet_list = tweets[item]['data'][0]

                        # Exclude retweets from the tweet list
                        filtered_tweets = [tweet for tweet in tweet_list if
                                           not any(
                                               rt["type"] == "retweeted" for rt in tweet.get("referenced_tweets", []))]
                except Exception as E:
                    print(E)
            return filtered_tweets

        def delete_links(text):
            return re.sub(r'https?://\S+', '', text)

        def delete_post_question_mark(text):
            return re.sub(r' post \?', '', text)

        def check_unique_tweet_ids(tweets):
            tweet_ids = set()

            for tweet in tweets:
                tweet_id = tweet["id"]
                if tweet_id in tweet_ids:
                    return False
                tweet_ids.add(tweet_id)

            return True

        tweets = exclude_retweets(tweets)
        for tweet in tweets:
            tweet["text"] = delete_links(tweet["text"])
            tweet["text"] = delete_post_question_mark(tweet["text"])

        if check_unique_tweet_ids(tweets):
            print("All tweet IDs are unique.")
        else:
            print("Duplicate tweet IDs found.")

        return tweets

    processed_tweets = process_tweets(topic_dfs)

    def get_user_image(user_id):
        """
        This function takes the user_id and fetches the user image


        :param user_id:
        :return:
        """
        user_url = f"https://api.twitter.com/2/users/{user_id}?user.fields=profile_image_url"
        response = requests.get(user_url, headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            return user_data.get("data", {}).get("profile_image_url", "")
        else:
            return ""

    def add_labels_based_on_user_id(user_name):
        """
        Loads the hand labelled accounts and tries to match the username given to one in the file.

        :param user_name: a given tweet username
        :return: the label (gov, academic, media, etc...)
        """
        big_csv_df = pd.read_csv("finalized_8K_accounts_emojis_replaced.csv")

        user_id_to_label = dict(zip(big_csv_df['username'], big_csv_df['hand.label']))
        label = user_id_to_label.get(user_name, None)

        return label

    def clean_and_process_tweets(tweet_df):
        a_terms = {
            'Tampa': ['Tampa Bay Times', 'Tampa Bay Waterkeeper', 'CBS Tampa'],
            'Pinellas.Clearwater': [],
            'Pinellas.StPete': ['St Pete Catalyst', 'stpetecatalyst'],
            'Manatee': ['Bradenton Herald'],
            'Sarasota': ['Sarasota Magazine', 'Sarasota Herald', 'sarasotamagazine'],
            'Pasco': [],
        }

        shaky_links = {
            'Tampa': ['https://www.baynews9.com/fl/tampa/', 'https://www.cbsnews.com/tampa/'],
            'Pinellas.Clearwater': [],
            'Pinellas.StPete': [],
            'Manatee': ['bradenton.com', 'https://www.abcactionnews.com/news/region-sarasota-manatee/'],
            'Sarasota': ['https://www.abcactionnews.com/news/region-sarasota-manatee/'],
            'Pasco': [],
        }

        tweet_df = pd.DataFrame(tweet_df)
        for location, terms in a_terms.items():
            for term in terms:
                term_pattern = rf'\b{re.escape(term)}\b'
                tweet_df = tweet_df[~tweet_df['text'].str.contains(term_pattern, case=False, regex=True)]

            for link in shaky_links.get(location, []):
                link_pattern = re.escape(link)
                tweet_df = tweet_df[~tweet_df['text'].str.contains(link_pattern, case=False, regex=True)]

        bad_link_pattern = r'patch\.com/florida/[a-zA-Z0-9]*'
        for location in a_terms.keys():
            tweet_df = tweet_df[~tweet_df['text'].str.contains(bad_link_pattern, case=False, regex=True)]

        merged_df = tweet_df.copy()

        for location, terms in a_terms.items():
            original_tweets = tweet_df.copy()
            retweets = merged_df[merged_df['id'].isin(original_tweets['id']) == False]
            combined_df = pd.concat([original_tweets, retweets], ignore_index=True)
            combined_df.sort_values(by='created_at', ascending=False, inplace=True)
            combined_df['label'] = 'No Label'
            username = combined_df['entities'][0]['mentions'][0]['username']
            combined_df['username'] = username
            description = combined_df['context_annotations'][0][0]['domain']['description']
            combined_df['account_description'] = description

            combined_df['location'] = location
            merged_df = combined_df

        merged_df['retweet_count'] = merged_df['public_metrics'].apply(lambda x: x['retweet_count'])
        merged_df['reply_count'] = merged_df['public_metrics'].apply(lambda x: x['reply_count'])
        merged_df['like_count'] = merged_df['public_metrics'].apply(lambda x: x['like_count'])
        merged_df['quote_count'] = merged_df['public_metrics'].apply(lambda x: x['quote_count'])
        merged_df['impression_count'] = merged_df['public_metrics'].apply(lambda x: x['impression_count'])
        merged_df.drop(columns=['public_metrics'], inplace=True)
        merged_df['user_image_url'] = merged_df['author_id'].apply(get_user_image)
        merged_df['label'] = merged_df['author_id'].apply(lambda x: add_labels_based_on_user_id(x))

        """
        if not merged_df['id'].is_unique:
            print("Duplicate tweet IDs found in the DataFrame.")
        else:
            print("All tweet IDs are unique in the DataFrame.")
        """
        return merged_df

    cleaned_tweets_df = clean_and_process_tweets(processed_tweets)
    engagement_columns = ['retweet_count', 'reply_count', 'like_count', 'quote_count', 'impression_count']
    cleaned_tweets_df['engagement'] = cleaned_tweets_df[engagement_columns].sum(axis=1)
    selected_columns = ['text', 'username', 'created_at', 'user_image_url', 'location', 'engagement', 'label']
    data = cleaned_tweets_df[selected_columns]
    data.rename(columns={'created_at': 'time', 'user_image_url': 'image'}, inplace=True)
    data['time'] = pd.to_datetime(data['time'])

    # Deposit into Database
    MONGO_URI = "mongodb+srv://Neffati:y4m4SKKmoIg6riCP@cluster0.h1xa7vw.mongodb.net/?retryWrites=true&w=majority"
    connection = pymongo.MongoClient(MONGO_URI)

    db = connection.tweets
    all_tweets = db.all_tweets


    all_tweets.insert_many(data.to_dict('records'))
    return 'Successfully Queried Twitter'
