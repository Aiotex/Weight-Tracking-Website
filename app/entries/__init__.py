from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
from datetime import date
from datetime import datetime
from datetime import timedelta


from ..db import get_db_connection
from ..auth import permission_required

bp = Blueprint('entries', __name__, template_folder="templates", static_folder="static")


"""
    Main page / dashboard
"""
@bp.route('/')
def dashboard():
    if g.user is None: # Return to landing page if user is not logged in
        return render_template('index.html')

    
    return render_template('dashboard.html', entry_date=date.today())


'''
    Create an entry, update the weight if the 
    an entry with the same date already exists
'''
@bp.route('/create', methods=('POST',))
@permission_required
def create():
    entry_date = request.form['entryDate']
    weight = "{:.1f}".format(float(request.form['weight'])) 
    error = None
    
    db = get_db_connection()
    
    if not weight:
        error = 'Weight is required'
    if not entry_date:
        error = 'Date is required'
    if error is not None:
        flash(error)
    else:
        try: # Add an entry
            db.execute(
                '''
                    INSERT INTO entries (user_id, entry_date, weight)
                    VALUES (?, ?, ?)
                ''', (g.user['id'], entry_date, weight)
            )
        except db.IntegrityError: # Update entry with matching date
            db.execute(
                '''
                    UPDATE entries
                    SET weight = ?
                    WHERE entry_date = ?
                ''', (weight, entry_date)
            )
        db.commit()
    return redirect(url_for('entries.dashboard'))


@bp.route('/delete/<int:id>', methods=('POST',))
@permission_required
def delete(id):
    db = get_db_connection()
    db.execute(
        '''
            DELETE FROM entries
            WHERE id = ?
        ''', (id, )
    )
    db.commit()
    return redirect(url_for('entries.dashboard'))
 
 
 # make it so when you click an entry it loads the date into the add entry form
@bp.route('/update/<int:id>', methods=('POST',))
@permission_required
def update(id):
    weight = "{:.1f}".format(float(request.form['weight'])) 
    error = None

    if not weight:
        error = 'Weight is required.'
    if error is not None:
        flash(error)
    else:
        db = get_db_connection()
        db.execute(
            '''
                UPDATE entries 
                SET weight = ?
                WHERE id = ?
            ''', (weight, id)
        )
        db.commit()
    return redirect(url_for('entries.dashboard'))


@bp.route('/graph', methods=('GET',))
@permission_required
def graph():   
    today = datetime(2023, 10, 22, 0, 0)
     
    # The time period defines the span of time (e.g., a week, a month, or a year)
    # over which data is analyzed
    # 'a'   :   all (default)
    # 'w'   :   week
    # 'm'   :   month
    # 'q'   :   3 months (quarter)
    # 'h'   :   6 months (half-year)
    # 'y'   :   12 months (year)
    
    time_period = {
        'a': datetime.fromtimestamp(0),
        'w': today - timedelta(days=7),
        'm': today - timedelta(days=30),
        'q': today - timedelta(days=90),
        'h': today - timedelta(days=180),
        'y': today - timedelta(days=365),
    }
    
    # Combines all data within that interval to calculate a summary,
    # like an average weight for each week or month
    # 'd'   :   day (default)
    # 'w'   :   week
    # 'm'   :   month
    # 'y'   :   year
    
    group_by = { 
        'd': 
            '''
                SELECT entry_date, weight
                FROM entries
                WHERE user_id = ? AND entry_date >= ?
                ORDER BY entry_date
            ''', 
        'w': 
            '''
                SELECT 
                    strftime('%Y-%W', entry_date) AS week_number,
                    ROUND(AVG(weight), 1) AS average_weight
                FROM entries
                WHERE user_id = ? 
                AND strftime('%Y-%W', entry_date) > strftime('%Y-%W', ?)
                GROUP BY strftime('%Y-%W', entry_date)
                ORDER BY week_number
            ''',
        'm':  
            '''
                SELECT 
                    strftime('%Y-%m', entry_date) AS month_number,
                    ROUND(AVG(weight), 1) AS average_weight
                FROM entries
                WHERE user_id = ? 
                AND strftime('%Y-%m', entry_date) > strftime('%Y-%m', ?)
                GROUP BY strftime('%Y-%m', entry_date)
                ORDER BY month_number
            ''',
        'y':   
            '''
                SELECT 
                    strftime('%Y', entry_date) AS year_number,
                    ROUND(AVG(weight), 1) AS average_weight
                FROM entries
                WHERE user_id = ?
                AND strftime('%Y', entry_date) > strftime('%Y', ?)
                GROUP BY strftime('%Y', entry_date)
                ORDER BY year_number
            ''',
    }

    
    # Fetch entries with paramaters applied
    db = get_db_connection()
    query = group_by[request.args.get('group_by')]
    args = (g.user['id'], time_period[request.args.get('time_period')])
    result = db.execute(query, args).fetchall()
    
    return render_template('graph.html', entries=result, today=today)